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
import requests
import json
from typing import Tuple, List, Optional, Dict, Any
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

        # Chatbot API configuration
        self.chatbot_api_url = os.getenv(
            'CHATBOT_API_URL', 'http://localhost:3000/api/chatbot')
        self.backend_api_url = os.getenv(
            'BACKEND_API_URL', 'http://localhost:3000/api')

        # Product knowledge cache
        self.product_cache = {}
        self.category_cache = {}
        self.last_cache_update = 0
        self.cache_ttl = 300  # 5 minutes

        # Intent patterns for Vietnamese - Enhanced with product knowledge
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
            Intent.SEARCH_PRODUCTS: [
                r"(?:tìm kiếm|search|find)\s+(?:theo|by)\s+(?:danh mục|category)",
                r"(?:xem|show)\s+(?:tất cả|all)\s+(?:danh mục|categories)",
                r"(?:sản phẩm|products)\s+(?:trong|of)\s+(?:danh mục|category)",
                r"(?:naruto|one piece|dragon ball|demon slayer|my hero academia|attack on titan|jujutsu kaisen)"
            ],
            Intent.CHECK_STOCK: [
                r"(?:còn hàng|in stock|available|hết hàng|out of stock)",
                r"(?:kiểm tra|check)\s+(?:hàng tồn kho|stock|availability)",
                r"(?:số lượng|quantity)\s+(?:còn lại|remaining)"
            ],
            Intent.CUSTOMIZATION_INQUIRY: [
                r"(?:tùy chỉnh|customize|customization)",
                r"(?:màu sắc|color|size|accessory|phụ kiện)",
                r"(?:thay đổi|change|modify)\s+(?:màu|color|size)"
            ],
            Intent.PRICE_INQUIRY: [
                r"(?:giá|price|cost|bao nhiêu|rẻ|đắt)",
                r"(?:khuyến mãi|sale|discount|promotion)",
                r"(?:so sánh|compare)\s+(?:giá|price)"
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
            ],
            Intent.HELP: [
                r"(?:giúp|help|hỗ trợ|support|tư vấn|advice)",
                r"(?:không hiểu|don't understand|confused)",
                r"(?:hướng dẫn|guide|instruction|tutorial)"
            ]
        }

        # Entity extraction patterns - Enhanced with product knowledge
        self.entity_patterns = {
            "product": [
                # Character names - case insensitive
                r"(naruto|uzumaki|sasuke|kakashi|itachi|minato|madara|hinata|jiraya)",
                r"(goku|vegeta|gohan|piccolo|frieza|cell|majin buu|goku black|jiren|beerus|whis)",
                r"(luffy|zoro|sanji|nami|chopper|robin|brook|franky|jinbe|ace|law|kid|katakuri)",
                r"(ichigo|rukia|byakuya|kenpachi|aizen)",
                r"(eren|mikasa|levi|armin|annie)",
                r"(tanjiro|nezuko|zenitsu|inosuke|giyu|rengoku)",
                r"(deku|bakugo|todoroki|all might|endeavor|uraraka|kirishima)",
                # Series names
                r"(one piece|dragon ball|naruto|bleach|attack on titan|demon slayer|my hero academia|jujutsu kaisen)",
                r"(studio ghibli|spirited away|totoro|princess mononoke)",
                # General patterns
                r"(?:mô hình|figure|model)\s+([a-z\s]+)",
                r"(?:anime|manga)\s+([a-z\s]+)",
                r"(?:nhân vật|character)\s+([a-z\s]+)"
            ],
            "category": [
                r"(naruto|one piece|dragon ball|demon slayer|my hero academia|attack on titan|jujutsu kaisen)",
                r"(anime|manga|figure|mô hình|nhân vật)"
            ],
            "quantity": [
                r"(\d+)\s+(?:cái|chiếc|mô hình|figure|sản phẩm)",
                r"(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s+(?:cái|chiếc)",
                r"(\d+)"  # Any number
            ],
            "color": [
                r"(?:màu\s+)?(đỏ|xanh|vàng|đen|trắng|hồng|tím|cam|red|blue|yellow|black|white|pink|purple|orange)"
            ],
            "price_range": [
                r"(?:giá\s+)?(rẻ|cheap|đắt|expensive|cao|thấp|low|high)",
                r"(\d+)\s*(?:triệu|tr|nghìn|k|đồng|vnd)",
                r"(?:dưới|under|trên|over)\s+(\d+)\s*(?:triệu|tr|nghìn|k)"
            ]
        }

    async def refresh_product_cache(self):
        """Refresh product and category cache from backend"""
        try:
            current_time = time.time()
            if current_time - self.last_cache_update < self.cache_ttl:
                return  # Cache still valid

            # Fetch products from backend
            products_response = requests.get(
                f"{self.backend_api_url}/products")
            if products_response.status_code == 200:
                self.product_cache = {
                    p['id']: p for p in products_response.json()}

            # Fetch categories from backend
            categories_response = requests.get(
                f"{self.backend_api_url}/categories")
            if categories_response.status_code == 200:
                self.category_cache = {
                    c['id']: c for c in categories_response.json()}

            self.last_cache_update = current_time
            logger.info(
                f"Product cache refreshed: {len(self.product_cache)} products, {len(self.category_cache)} categories")

        except Exception as e:
            logger.error(f"Error refreshing product cache: {e}")

    async def query_chatbot(self, text: str, language: str = 'vi-VN') -> Dict[str, Any]:
        """Query the chatbot service for intelligent responses"""
        try:
            response = requests.post(
                f"{self.chatbot_api_url}/query",
                json={
                    "text": text,
                    "language": language,
                    "context": {"source": "voice_agent"}
                },
                timeout=10
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Chatbot API returned {response.status_code}")
                return {}

        except Exception as e:
            logger.error(f"Error querying chatbot: {e}")
            return {}

    async def get_product_recommendations(self, intent: str, entities: List[Entity]) -> List[Dict[str, Any]]:
        """Get product recommendations based on intent and entities"""
        await self.refresh_product_cache()

        recommendations = []

        # Extract product-related entities
        product_names = [e.value for e in entities if e.type == "product"]
        categories = [e.value for e in entities if e.type == "category"]
        price_ranges = [e.value for e in entities if e.type == "price_range"]

        if not self.product_cache:
            return recommendations

        # Filter products based on entities
        for product in self.product_cache.values():
            score = 0

            # Product name match
            if any(name.lower() in product['name'].lower() for name in product_names):
                score += 10

            # Category match
            if categories and product.get('category') and any(cat.lower() in product['category']['name'].lower() for cat in categories):
                score += 8

            # Price range match
            if price_ranges:
                price = float(product['price'])
                for price_range in price_ranges:
                    if 'rẻ' in price_range.lower() or 'cheap' in price_range.lower():
                        if price < 2000000:  # Under 2M VND
                            score += 5
                    elif 'đắt' in price_range.lower() or 'expensive' in price_range.lower():
                        if price > 3000000:  # Over 3M VND
                            score += 5

            if score > 0:
                recommendations.append({
                    **product,
                    'relevance_score': score
                })

        # Sort by relevance score and return top 5
        recommendations.sort(key=lambda x: x['relevance_score'], reverse=True)
        return recommendations[:5]

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

                # Query chatbot for intelligent response
                chatbot_response = await self.query_chatbot(transcript, language.value)

                # Get product recommendations if relevant
                product_recommendations = []
                if intent in [Intent.GET_PRODUCT_INFO, Intent.SEARCH_PRODUCTS]:
                    product_recommendations = await self.get_product_recommendations(intent, entities)

                # Generate enhanced response
                response_text = self._generate_enhanced_response(
                    intent, entities, transcript, chatbot_response, product_recommendations)

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
                    processing_time_ms=processing_time,
                    product_recommendations=product_recommendations
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

    def _matches_price_range(self, price: float, price_range: str) -> bool:
        """Check if a price matches the specified price range"""
        try:
            if price_range.startswith("under_"):
                max_price = float(price_range.split("_")[1])
                return price <= max_price
            elif price_range.startswith("over_"):
                min_price = float(price_range.split("_")[1])
                return price >= min_price
            elif price_range in ["low", "rẻ", "cheap"]:
                return price < 2000000  # Under 2M VND
            elif price_range in ["high", "đắt", "expensive"]:
                return price > 3000000  # Over 3M VND
            else:
                return True  # No filter applied
        except:
            return True

    def _extract_intent(self, text: str) -> str:
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
                    value = match.group(
                        1) if match.groups() else match.group(0)
                    entities.append(Entity(
                        type=entity_type,
                        value=value,
                        confidence=0.8
                    ))

        return entities

    def _calculate_confidence(self, text: str, intent: str, entities: List[Entity]) -> float:
        """Calculate confidence score for the extracted intent and entities"""
        base_confidence = 0.5

        # Boost confidence based on text length and clarity
        if len(text.strip()) > 10:
            base_confidence += 0.2

        # Boost confidence if entities are found
        if entities:
            base_confidence += 0.2

        # Boost confidence for specific intents
        if intent in [Intent.GREETING, Intent.GOODBYE]:
            base_confidence += 0.1

        return min(max(base_confidence, 0.0), 1.0)

    def _generate_enhanced_response(self, intent: str, entities: List[Entity], transcript: str,
                                    chatbot_response: Dict[str, Any], product_recommendations: List[Dict[str, Any]]) -> str:
        """Generate enhanced response using chatbot and product knowledge"""

        # Use chatbot response if available
        if chatbot_response.get('response'):
            base_response = chatbot_response['response']
        else:
            base_response = self._generate_basic_response(
                intent, entities, transcript)

        # Enhance with product recommendations
        if product_recommendations:
            product_info = self._format_product_recommendations(
                product_recommendations)
            if product_info:
                base_response += f"\n\n{product_info}"

        return base_response

    def _format_product_recommendations(self, recommendations: List[Dict[str, Any]]) -> str:
        """Format product recommendations for voice response"""
        if not recommendations:
            return ""

        response = "Tôi tìm thấy một số sản phẩm phù hợp:\n"

        # Limit to top 3 for voice
        for i, product in enumerate(recommendations[:3], 1):
            name = product.get('name', 'Unknown')
            price = product.get('price', 0)
            category = product.get('category', {}).get('name', 'Unknown')

            # Format price in Vietnamese
            if price >= 1000000:
                price_str = f"{price // 1000000} triệu VND"
            else:
                price_str = f"{price:,} VND"

            response += f"{i}. {name} - {category} - Giá {price_str}\n"

        return response

    def _generate_basic_response(self, intent: str, entities: List[Entity], transcript: str) -> str:
        """Generate basic response when chatbot is not available"""
        responses = {
            Intent.CREATE_ORDER: "Tôi sẽ giúp bạn đặt hàng. Bạn muốn mua sản phẩm nào?",
            Intent.CANCEL_ORDER: "Tôi hiểu bạn muốn hủy đơn hàng. Bạn có thể cung cấp mã đơn hàng không?",
            Intent.CHECK_ORDER_STATUS: "Tôi sẽ kiểm tra trạng thái đơn hàng cho bạn. Bạn có mã đơn hàng không?",
            Intent.GET_PRODUCT_INFO: "Tôi sẽ tìm thông tin sản phẩm cho bạn. Bạn quan tâm đến sản phẩm nào?",
            Intent.SEARCH_PRODUCTS: "Tôi sẽ giúp bạn tìm kiếm sản phẩm. Bạn muốn tìm theo danh mục nào?",
            Intent.CHECK_STOCK: "Tôi sẽ kiểm tra tình trạng hàng tồn kho. Bạn muốn kiểm tra sản phẩm nào?",
            Intent.CUSTOMIZATION_INQUIRY: "Tôi sẽ giải thích về các tùy chọn tùy chỉnh. Bạn muốn tùy chỉnh sản phẩm nào?",
            Intent.PRICE_INQUIRY: "Tôi sẽ cung cấp thông tin về giá cả. Bạn muốn biết giá của sản phẩm nào?",
            Intent.GREETING: "Xin chào! Tôi là trợ lý ảo của Figuro. Tôi có thể giúp bạn tìm sản phẩm, đặt hàng, hoặc tư vấn về mô hình figure. Bạn cần hỗ trợ gì?",
            Intent.GOODBYE: "Cảm ơn bạn đã sử dụng dịch vụ của Figuro. Hẹn gặp lại!",
            Intent.HELP: "Tôi có thể giúp bạn: tìm kiếm sản phẩm, xem danh mục, kiểm tra giá cả, theo dõi đơn hàng, và tư vấn tùy chỉnh. Bạn cần hỗ trợ gì cụ thể?"
        }

        return responses.get(intent, "Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn. Bạn có thể nói rõ hơn được không?")

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
