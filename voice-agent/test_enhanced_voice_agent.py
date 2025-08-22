#!/usr/bin/env python3
"""
Enhanced Voice Agent Test Suite
Tests the voice agent with chatbot integration and product knowledge base
"""

import asyncio
import requests
import json
from typing import Dict, Any


class EnhancedVoiceAgentTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []

    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")

        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    async def test_health_check(self):
        """Test voice agent health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/voice/health")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check", True,
                              f"Status: {data.get('status')}")
            else:
                self.log_test("Health Check", False,
                              f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")

    async def test_text_processing(self):
        """Test text processing with chatbot integration"""
        test_cases = [
            {
                "text": "Tôi muốn tìm mô hình Naruto",
                "expected_intent": "get_product_info",
                "description": "Product search in Vietnamese"
            },
            {
                "text": "Show me Dragon Ball figures",
                "expected_intent": "get_product_info",
                "description": "Product search in English"
            },
            {
                "text": "Xin chào, bạn có thể giúp tôi không?",
                "expected_intent": "greeting",
                "description": "Greeting in Vietnamese"
            },
            {
                "text": "Tôi muốn xem sản phẩm trong danh mục One Piece",
                "expected_intent": "search_products",
                "description": "Category-based search"
            },
            {
                "text": "Giá của sản phẩm này bao nhiêu?",
                "expected_intent": "price_inquiry",
                "description": "Price inquiry"
            }
        ]

        for test_case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/voice/process-text",
                    json={
                        "text": test_case["text"],
                        "language": "vi-VN",
                        "enable_tts": False
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    intent = data.get("intent")
                    success = intent == test_case["expected_intent"]
                    self.log_test(
                        f"Text Processing: {test_case['description']}",
                        success,
                        f"Expected: {test_case['expected_intent']}, Got: {intent}"
                    )
                else:
                    self.log_test(
                        f"Text Processing: {test_case['description']}",
                        False,
                        f"Status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_test(
                    f"Text Processing: {test_case['description']}",
                    False,
                    f"Error: {str(e)}"
                )

    async def test_product_search(self):
        """Test voice-based product search"""
        search_queries = [
            {
                "query": "Naruto figures",
                "expected_category": "Naruto",
                "description": "Search by character name"
            },
            {
                "query": "Dragon Ball models",
                "expected_category": "Dragon Ball",
                "description": "Search by series name"
            },
            {
                "query": "sản phẩm giá rẻ",
                "price_filter": "low",
                "description": "Search by price range"
            }
        ]

        for search_case in search_queries:
            try:
                params = {"query": search_case["query"]}
                if "price_filter" in search_case:
                    params["price_range"] = search_case["price_filter"]

                response = requests.get(
                    f"{self.base_url}/voice/products/search", params=params)

                if response.status_code == 200:
                    data = response.json()
                    products = data.get("products", [])
                    success = len(products) > 0
                    self.log_test(
                        f"Product Search: {search_case['description']}",
                        success,
                        f"Found {len(products)} products"
                    )
                else:
                    self.log_test(
                        f"Product Search: {search_case['description']}",
                        False,
                        f"Status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_test(
                    f"Product Search: {search_case['description']}",
                    False,
                    f"Error: {str(e)}"
                )

    async def test_product_categories(self):
        """Test product categories endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/voice/products/categories")

            if response.status_code == 200:
                data = response.json()
                categories = data.get("categories", [])
                expected_categories = [
                    "Naruto", "One Piece", "Dragon Ball", "Demon Slayer",
                    "My Hero Academia", "Attack on Titan", "Jujutsu Kaisen", "Other Anime"
                ]

                found_categories = [cat["name"] for cat in categories]
                missing_categories = set(
                    expected_categories) - set(found_categories)

                success = len(missing_categories) == 0
                self.log_test(
                    "Product Categories",
                    success,
                    f"Found {len(categories)} categories. Missing: {missing_categories if missing_categories else 'None'}"
                )
            else:
                self.log_test("Product Categories", False,
                              f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Product Categories", False, f"Error: {str(e)}")

    async def test_product_recommendations(self):
        """Test product recommendations based on voice intent"""
        test_cases = [
            {
                "intent": "get_product_info",
                "category": "Naruto",
                "description": "Naruto category recommendations"
            },
            {
                "intent": "search_products",
                "category": "Dragon Ball",
                "description": "Dragon Ball category recommendations"
            },
            {
                "intent": "price_inquiry",
                "price_max": 2000000,
                "description": "Affordable product recommendations"
            }
        ]

        for test_case in test_cases:
            try:
                params = {"intent": test_case["intent"]}
                if "category" in test_case:
                    params["category"] = test_case["category"]
                if "price_max" in test_case:
                    params["price_max"] = test_case["price_max"]

                response = requests.get(
                    f"{self.base_url}/voice/products/recommendations", params=params)

                if response.status_code == 200:
                    data = response.json()
                    recommendations = data.get("recommendations", [])
                    success = len(recommendations) > 0
                    self.log_test(
                        f"Product Recommendations: {test_case['description']}",
                        success,
                        f"Found {len(recommendations)} recommendations"
                    )
                else:
                    self.log_test(
                        f"Product Recommendations: {test_case['description']}",
                        False,
                        f"Status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_test(
                    f"Product Recommendations: {test_case['description']}",
                    False,
                    f"Error: {str(e)}"
                )

    async def test_chatbot_integration(self):
        """Test chatbot integration via voice agent"""
        test_queries = [
            {
                "text": "Tôi muốn tìm sản phẩm Naruto",
                "description": "Vietnamese product search query"
            },
            {
                "text": "What Dragon Ball figures do you have?",
                "description": "English product search query"
            },
            {
                "text": "Giá của sản phẩm này bao nhiêu?",
                "description": "Price inquiry query"
            }
        ]

        for test_case in test_queries:
            try:
                response = requests.post(
                    f"{self.base_url}/voice/chatbot/query",
                    params={
                        "text": test_case["text"],
                        "language": "vi-VN"
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    chatbot_response = data.get("response", {})
                    success = bool(chatbot_response)
                    self.log_test(
                        f"Chatbot Integration: {test_case['description']}",
                        success,
                        f"Response received: {bool(chatbot_response)}"
                    )
                else:
                    self.log_test(
                        f"Chatbot Integration: {test_case['description']}",
                        False,
                        f"Status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_test(
                    f"Chatbot Integration: {test_case['description']}",
                    False,
                    f"Error: {str(e)}"
                )

    async def test_voice_streaming(self):
        """Test real-time voice response streaming"""
        test_queries = [
            {
                "query": "Tôi muốn xem sản phẩm Naruto",
                "description": "Vietnamese product query"
            },
            {
                "query": "Show me One Piece figures",
                "description": "English product query"
            }
        ]

        for test_case in test_queries:
            try:
                response = requests.get(
                    f"{self.base_url}/voice/stream",
                    params={
                        "query": test_case["query"],
                        "language": "vi-VN"
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    response_text = data.get("response")
                    products = data.get("products", [])
                    suggested_actions = data.get("suggested_actions", [])

                    success = bool(response_text) and len(products) >= 0
                    self.log_test(
                        f"Voice Streaming: {test_case['description']}",
                        success,
                        f"Response: {len(response_text) if response_text else 0} chars, Products: {len(products)}, Actions: {len(suggested_actions)}"
                    )
                else:
                    self.log_test(
                        f"Voice Streaming: {test_case['description']}",
                        False,
                        f"Status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_test(
                    f"Voice Streaming: {test_case['description']}",
                    False,
                    f"Error: {str(e)}"
                )

    async def run_all_tests(self):
        """Run all test cases"""
        print("🚀 Starting Enhanced Voice Agent Test Suite")
        print("=" * 60)

        await self.test_health_check()
        await self.test_text_processing()
        await self.test_product_search()
        await self.test_product_categories()
        await self.test_product_recommendations()
        await self.test_chatbot_integration()
        await self.test_voice_streaming()

        # Print summary
        print("\n" + "=" * 60)
        print("📊 Test Summary")
        print("=" * 60)

        total_tests = len(self.test_results)
        passed_tests = sum(
            1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests

        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")

        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")

        return passed_tests == total_tests


def main():
    """Main function to run the test suite"""
    tester = EnhancedVoiceAgentTester()

    try:
        # Run tests
        success = asyncio.run(tester.run_all_tests())

        if success:
            print("\n🎉 All tests passed! Enhanced Voice Agent is working correctly.")
            return 0
        else:
            print("\n⚠️  Some tests failed. Please check the details above.")
            return 1

    except KeyboardInterrupt:
        print("\n⏹️  Test suite interrupted by user.")
        return 1
    except Exception as e:
        print(f"\n💥 Test suite failed with error: {str(e)}")
        return 1


if __name__ == "__main__":
    exit(main())
