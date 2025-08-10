import os
import time
import tempfile
import logging
import speech_recognition as sr
import pyttsx3
from gtts import gTTS
import librosa
import soundfile as sf
import numpy as np
import re
from typing import Tuple, List, Optional
from pathlib import Path
from fastapi import UploadFile, HTTPException
from .schemas import (
    SupportedLanguage, Intent, Entity, AudioFormat,
    VoiceResponse, TTSRequest
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VoiceAgentService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.tts_engine = pyttsx3.init()
        self.setup_tts_engine()

        # Intent patterns for Vietnamese - Expanded and more flexible
        self.intent_patterns = {
            Intent.CREATE_ORDER: [
                r"(?:muốn|cần|đặt|mua|order|lấy|có thể)\s*(?:một|mô hình|figure|sản phẩm)",
                r"(?:tôi|em|mình)\s+(?:muốn|cần|đặt|mua|lấy)",
                r"(?:có thể|được không)\s+(?:đặt|mua|order|lấy)",
                r"(?:thêm|add)\s+(?:vào|into)\s+(?:giỏ|cart)",
                r"(?:mua|đặt|order)\s+(?:ngay|luôn|now)",
                r"(?:muốn|cần)\s+(?:mua|đặt|order)"
            ],
            Intent.CANCEL_ORDER: [
                r"(?:hủy|cancel)\s+(?:đơn|order)",
                r"(?:không|ko)\s+(?:muốn|cần)\s+(?:nữa|rồi)",
                r"(?:bỏ|hủy)\s+(?:đặt hàng|order)"
            ],
            Intent.CHECK_ORDER_STATUS: [
                r"(?:kiểm tra|check|xem)\s+(?:đơn|order|trạng thái)",
                r"(?:đơn|order)\s+(?:của|tôi|em)\s+(?:thế nào|ra sao)",
                r"(?:tình trạng|status)\s+(?:đơn hàng|order)",
                r"(?:đơn hàng|order)\s+(?:đang|hiện tại)"
            ],
            Intent.GET_PRODUCT_INFO: [
                # Broader patterns for product searches
                r"(?:tôi|em|mình)\s+(?:muốn|cần)\s+(?:tìm|find|search)\s*(?:sản phẩm|mô hình|figure)",
                r"(?:tìm|find|search)\s+(?:sản phẩm|mô hình|figure|product)",
                r"(?:cho|show|hiển thị)\s+(?:tôi|em|mình)\s+(?:sản phẩm|mô hình|figure)",
                r"(?:có|available)\s+(?:sản phẩm|mô hình|figure)\s+(?:gì|nào|what)",
                r"(?:gợi ý|suggest|recommend)\s+(?:sản phẩm|mô hình|figure)",
                r"(?:thông tin|info|chi tiết)\s+(?:về|của|about)\s+(?:sản phẩm|mô hình|figure)",
                r"(?:giá|price|cost)\s+(?:của|bao nhiêu|how much)",
                r"(?:mô tả|description)\s+(?:sản phẩm|figure)",
                # Specific character names
                r"(?:naruto|goku|luffy|sasuke|vegeta|ichigo|eren)",
                r"(?:one piece|dragon ball|attack on titan|demon slayer|my hero academia)",
                r"(?:anime|manga)\s+(?:figure|mô hình)"
            ],
            Intent.GREETING: [
                r"(?:xin chào|hello|hi|chào|hey)",
                r"(?:chào|hello)\s+(?:bạn|anh|chị|admin|support)",
                r"(?:good morning|good afternoon|good evening)",
                r"(?:buổi sáng|buổi chiều|buổi tối)\s+(?:tốt lành|vui vẻ)"
            ],
            Intent.GOODBYE: [
                r"(?:tạm biệt|goodbye|bye|chào|see you)",
                r"(?:hẹn gặp lại|see you|until next time)",
                r"(?:cảm ơn|thank you)\s*(?:và|rồi|nhé|很多|much)?",
                r"(?:kết thúc|end|finish|done)"
            ]
        }

        # Entity extraction patterns - More comprehensive
        self.entity_patterns = {
            "product": [
                # Character names - case insensitive
                r"(naruto|uzumaki|sasuke|kakashi|itachi)",
                r"(goku|vegeta|gohan|piccolo|frieza|cell|majin buu)",
                r"(luffy|zoro|sanji|nami|chopper|robin|brook|franky|jinbe)",
                r"(ichigo|rukia|byakuya|kenpachi|aizen)",
                r"(eren|mikasa|levi|armin|annie)",
                r"(tanjiro|nezuko|zenitsu|inosuke|giyu)",
                r"(deku|bakugo|todoroki|all might|endeavor)",
                # Series names
                r"(one piece|dragon ball|naruto|bleach|attack on titan|demon slayer|my hero academia)",
                r"(studio ghibli|spirited away|totoro|princess mononoke)",
                # General patterns
                r"(?:mô hình|figure|model)\s+([a-z\s]+)",
                r"(?:anime|manga)\s+([a-z\s]+)",
                r"(?:nhân vật|character)\s+([a-z\s]+)"
            ],
            "quantity": [
                r"(\d+)\s+(?:cái|chiếc|mô hình|figure|sản phẩm)",
                r"(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s+(?:cái|chiếc)",
                r"(\d+)"  # Any number
            ],
            "color": [
                r"(?:màu\s+)?(đỏ|xanh|vàng|đen|trắng|hồng|tím|cam|red|blue|yellow|black|white|pink|purple|orange)"
            ]
        }

    def setup_tts_engine(self):
        """Setup text-to-speech engine with optimized settings"""
        voices = self.tts_engine.getProperty('voices')
        if voices:
            # Try to set a female voice if available
            for voice in voices:
                if 'female' in voice.name.lower() or 'woman' in voice.name.lower():
                    self.tts_engine.setProperty('voice', voice.id)
                    break

        self.tts_engine.setProperty('rate', 180)  # Speaking rate
        self.tts_engine.setProperty('volume', 0.9)  # Volume level

    async def process_audio_file(self, file: UploadFile, language: SupportedLanguage = SupportedLanguage.VIETNAMESE, enable_tts: bool = False) -> VoiceResponse:
        """Process uploaded audio file and return voice response"""
        start_time = time.time()

        try:
            # Validate file format
            if not self._is_valid_audio_format(file.filename):
                raise HTTPException(
                    status_code=400, detail="Unsupported audio format")

            # Save uploaded file temporarily
            temp_path = await self._save_temp_file(file)

            try:
                # Convert audio if needed and get transcript
                audio_path = await self._prepare_audio_file(temp_path)
                transcript = await self._speech_to_text(audio_path, language)

                # Process NLP
                intent = self._extract_intent(transcript)
                entities = self._extract_entities(transcript)
                confidence = self._calculate_confidence(
                    transcript, intent, entities)

                # Generate response
                response_text = self._generate_response(
                    intent, entities, transcript)

                # Generate TTS audio if requested
                audio_url = await self._generate_tts_audio(response_text, language) if enable_tts else None

                processing_time = int((time.time() - start_time) * 1000)

                return VoiceResponse(
                    transcript=transcript,
                    intent=intent,
                    entities=entities,
                    confidence=confidence,
                    response_text=response_text,
                    audio_url=audio_url,
                    processing_time_ms=processing_time
                )

            finally:
                # Cleanup temp files
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                if 'audio_path' in locals() and audio_path != temp_path and os.path.exists(audio_path):
                    os.unlink(audio_path)

        except Exception as e:
            logger.error(f"Error processing audio: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Audio processing failed: {str(e)}")

    def _is_valid_audio_format(self, filename: str) -> bool:
        """Check if the uploaded file has a valid audio format"""
        if not filename:
            return False

        extension = Path(filename).suffix.lower().lstrip('.')
        return extension in [format.value for format in AudioFormat]

    async def _save_temp_file(self, file: UploadFile) -> str:
        """Save uploaded file to temporary location"""
        suffix = Path(file.filename or "audio.wav").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            return temp_file.name

    async def _prepare_audio_file(self, file_path: str) -> str:
        """Prepare audio file for speech recognition (convert format if needed)"""
        try:
            # Load audio file
            audio, sr_rate = librosa.load(file_path, sr=16000)

            # Convert to WAV format for speech recognition
            wav_path = file_path.replace(Path(file_path).suffix, '.wav')
            sf.write(wav_path, audio, 16000)

            return wav_path
        except Exception as e:
            logger.error(f"Error preparing audio file: {str(e)}")
            return file_path

    async def _speech_to_text(self, audio_path: str, language: SupportedLanguage) -> str:
        """Convert speech to text using speech recognition"""
        try:
            with sr.AudioFile(audio_path) as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.record(source)

            # Use Google Speech Recognition
            try:
                transcript = self.recognizer.recognize_google(
                    audio, language=language.value)
                logger.info(f"Transcript: {transcript}")
                return transcript
            except sr.UnknownValueError:
                return "Không thể nhận diện được giọng nói"
            except sr.RequestError as e:
                logger.error(f"Speech recognition service error: {str(e)}")
                return "Lỗi dịch vụ nhận diện giọng nói"

        except Exception as e:
            logger.error(f"Error in speech to text: {str(e)}")
            return "Lỗi xử lý âm thanh"

    def _extract_intent(self, text: str) -> Intent:
        """Extract intent from text using pattern matching"""
        text_lower = text.lower()

        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return intent

        return Intent.UNKNOWN

    def _extract_entities(self, text: str) -> List[Entity]:
        """Extract entities from text using pattern matching"""
        entities = []
        text_lower = text.lower()

        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text_lower)
                for match in matches:
                    if match.groups():
                        value = match.group(1).strip()
                    else:
                        value = match.group(0).strip()

                    entities.append(Entity(
                        type=entity_type,
                        value=value,
                        confidence=0.8  # Simple confidence score
                    ))

        return entities

    def _calculate_confidence(self, transcript: str, intent: Intent, entities: List[Entity]) -> float:
        """Calculate overall confidence score"""
        base_confidence = 0.7

        # Boost confidence if intent is not unknown
        if intent != Intent.UNKNOWN:
            base_confidence += 0.2

        # Boost confidence based on entities found
        if entities:
            base_confidence += min(0.1 * len(entities), 0.1)

        # Reduce confidence for very short transcripts
        if len(transcript.split()) < 3:
            base_confidence -= 0.1

        return min(max(base_confidence, 0.0), 1.0)

    def _generate_response(self, intent: Intent, entities: List[Entity], transcript: str) -> str:
        """Generate appropriate response based on intent and entities"""

        # Extract relevant entities
        product_entities = [e for e in entities if e.type == "product"]
        quantity_entities = [e for e in entities if e.type == "quantity"]

        if intent == Intent.CREATE_ORDER:
            if product_entities:
                product_name = product_entities[0].value
                quantity = quantity_entities[0].value if quantity_entities else "1"
                return f"Tôi hiểu bạn muốn đặt {quantity} sản phẩm {product_name}. Để đặt hàng, bạn có thể vào trang sản phẩm và thêm vào giỏ hàng. Tôi có thể giúp bạn tìm kiếm sản phẩm này không?"
            else:
                return "Bạn muốn đặt hàng sản phẩm gì? Hãy cho tôi biết tên sản phẩm bạn quan tâm."

        elif intent == Intent.GET_PRODUCT_INFO:
            if product_entities:
                product_name = product_entities[0].value
                return f"Tôi hiểu bạn muốn biết thông tin về {product_name}. Hiện tại chúng tôi có nhiều mô hình figure chất lượng cao. Bạn có thể xem chi tiết sản phẩm trong trang Products hoặc tôi có thể giúp bạn tìm kiếm sản phẩm tương tự."
            else:
                return "Bạn muốn biết thông tin về sản phẩm nào? Chúng tôi có nhiều loại figure như Naruto, One Piece, Dragon Ball, và nhiều anime khác."

        elif intent == Intent.CHECK_ORDER_STATUS:
            return "Để kiểm tra trạng thái đơn hàng, bạn có thể vào trang 'Đơn hàng' trong menu. Ở đó bạn sẽ thấy tất cả đơn hàng và trạng thái hiện tại của chúng."

        elif intent == Intent.GREETING:
            return "Xin chào! Tôi là trợ lý ảo Figuro. Tôi có thể giúp bạn:\n- Tìm kiếm và tư vấn sản phẩm figure\n- Kiểm tra thông tin đơn hàng\n- Hướng dẫn đặt hàng\n- Trả lời câu hỏi về sản phẩm\n\nBạn cần tôi giúp gì?"

        elif intent == Intent.GOODBYE:
            return "Cảm ơn bạn đã sử dụng dịch vụ Figuro! Hy vọng bạn tìm được những sản phẩm figure ưng ý. Hẹn gặp lại!"

        else:  # Intent.UNKNOWN or others
            # Try to give more intelligent responses based on keywords
            text_lower = transcript.lower()

            # Check for product mentions even if intent wasn't recognized
            if any(keyword in text_lower for keyword in ['sản phẩm', 'mô hình', 'figure', 'anime', 'manga']):
                return "Tôi thấy bạn quan tâm đến sản phẩm figure! Chúng tôi có nhiều mô hình anime chất lượng cao. Bạn có thể:\n- Xem trang Products để duyệt tất cả sản phẩm\n- Nói tên nhân vật bạn muốn tìm (ví dụ: Naruto, Goku, Luffy)\n- Hỏi về giá cả hoặc thông tin chi tiết\n\nBạn muốn tìm mô hình nhân vật nào?"

            elif any(keyword in text_lower for keyword in ['đơn hàng', 'order', 'mua', 'đặt']):
                return "Tôi có thể giúp bạn về đơn hàng! Bạn có thể:\n- Kiểm tra trạng thái đơn hàng hiện tại\n- Đặt hàng sản phẩm mới\n- Hỏi về quy trình đặt hàng\n\nBạn cần hỗ trợ gì cụ thể về đơn hàng?"

            elif any(keyword in text_lower for keyword in ['giá', 'price', 'tiền', 'cost', 'bao nhiêu']):
                return "Bạn muốn hỏi về giá sản phẩm? Giá figure anime thường dao động từ 500,000đ đến 2,000,000đ tùy vào:\n- Kích thước và chất lượng\n- Thương hiệu sản xuất\n- Độ hiếm của nhân vật\n\nBạn muốn xem giá của sản phẩm nào cụ thể?"

            elif any(keyword in text_lower for keyword in ['help', 'giúp', 'hỗ trợ', 'support']):
                return "Tôi sẵn sàng hỗ trợ bạn! Tôi có thể giúp:\n✨ Tìm kiếm sản phẩm figure anime\n📦 Kiểm tra và theo dõi đơn hàng\n💰 Tư vấn giá cả và chất lượng\n🛒 Hướng dẫn đặt hàng\n📞 Chuyển sang tư vấn viên\n\nBạn cần hỗ trợ về vấn đề gì?"

            else:
                return f"Tôi chưa hiểu rõ ý bạn muốn nói '{transcript}'. Có thể bạn muốn:\n\n🔍 **Tìm sản phẩm**: 'Tôi muốn tìm mô hình Naruto'\n📦 **Kiểm tra đơn hàng**: 'Đơn hàng của tôi thế nào?'\n💡 **Tư vấn**: 'Gợi ý sản phẩm cho tôi'\n\nHãy thử nói lại với từ khóa rõ ràng hơn nhé!"

    async def _generate_tts_audio(self, text: str, language: SupportedLanguage) -> Optional[str]:
        """Generate text-to-speech audio file using gTTS for natural voice"""
        try:
            audio_dir = Path("app/static/audio")
            audio_dir.mkdir(parents=True, exist_ok=True)

            timestamp = int(time.time() * 1000)
            # Prefer mp3 from gTTS if available
            if gTTS is not None:
                audio_filename = f"response_{timestamp}.mp3"
                audio_path = audio_dir / audio_filename
                lang_map = {
                    SupportedLanguage.VIETNAMESE: "vi",
                    SupportedLanguage.ENGLISH: "en",
                    SupportedLanguage.JAPANESE: "ja",
                }
                gtts_lang = lang_map.get(language, "vi")
                tts = gTTS(text=text, lang=gtts_lang)
                tts.save(str(audio_path))
            else:
                # Fallback to local TTS engine (wav)
                audio_filename = f"response_{timestamp}.wav"
                audio_path = audio_dir / audio_filename
                self.tts_engine.save_to_file(text, str(audio_path))
                self.tts_engine.runAndWait()

            return f"/static/audio/{audio_filename}"

        except Exception as e:
            logger.error(f"Error generating TTS audio: {str(e)}")
            return None

    async def text_to_speech(self, request: TTSRequest) -> str:
        """Convert text to speech via gTTS and return audio file path"""
        try:
            audio_dir = Path("app/static/audio")
            audio_dir.mkdir(parents=True, exist_ok=True)

            timestamp = int(time.time() * 1000)

            if gTTS is not None:
                audio_filename = f"tts_{timestamp}.mp3"
                audio_path = audio_dir / audio_filename
                lang_map = {
                    SupportedLanguage.VIETNAMESE: "vi",
                    SupportedLanguage.ENGLISH: "en",
                    SupportedLanguage.JAPANESE: "ja",
                }
                gtts_lang = lang_map.get(request.language, "vi")
                tts = gTTS(text=request.text, lang=gtts_lang)
                tts.save(str(audio_path))
            else:
                audio_filename = f"tts_{timestamp}.wav"
                audio_path = audio_dir / audio_filename
                self.tts_engine.setProperty('rate', int(
                    180 * (request.voice_speed or 1.0)))
                self.tts_engine.save_to_file(request.text, str(audio_path))
                self.tts_engine.runAndWait()

            return f"/static/audio/{audio_filename}"

        except Exception as e:
            logger.error(f"Error in text to speech: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"TTS generation failed: {str(e)}")

    def health_check(self) -> dict:
        """Check the health of voice agent services"""
        services = {
            "speech_recognition": True,
            "text_to_speech": True,
            "nlp_processing": True
        }

        try:
            # Test TTS engine
            voices = self.tts_engine.getProperty('voices')
            services["text_to_speech"] = len(voices) > 0
        except:
            services["text_to_speech"] = False

        return {
            "status": "healthy" if all(services.values()) else "degraded",
            "services": services
        }


# Create global service instance
voice_service = VoiceAgentService()
