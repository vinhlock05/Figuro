#!/usr/bin/env python3
"""
Enhanced Voice Agent Demo
Demonstrates the voice agent capabilities with chatbot integration and product knowledge base
"""

import asyncio
import requests
import json
import time
from typing import Dict, Any


class EnhancedVoiceAgentDemo:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.demo_results = []

    def print_header(self, title: str):
        """Print a formatted header"""
        print("\n" + "=" * 60)
        print(f"🎯 {title}")
        print("=" * 60)

    def print_result(self, title: str, success: bool, details: str = ""):
        """Print formatted result"""
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{status}: {title}")
        if details:
            print(f"   📝 {details}")
        print()

    async def demo_health_check(self):
        """Demo health check functionality"""
        self.print_header("Health Check Demo")

        try:
            response = requests.get(f"{self.base_url}/voice/health")
            if response.status_code == 200:
                data = response.json()
                self.print_result(
                    "Health Check",
                    True,
                    f"Service Status: {data.get('status')}, Version: {data.get('version')}"
                )
                self.demo_results.append(("Health Check", True))
            else:
                self.print_result("Health Check", False,
                                  f"Status code: {response.status_code}")
                self.demo_results.append(("Health Check", False))
        except Exception as e:
            self.print_result("Health Check", False, f"Error: {str(e)}")
            self.demo_results.append(("Health Check", False))

    async def demo_text_processing(self):
        """Demo text processing with chatbot integration"""
        self.print_header("Text Processing Demo")

        test_cases = [
            {
                "text": "Tôi muốn tìm mô hình Naruto",
                "description": "Vietnamese product search"
            },
            {
                "text": "Show me Dragon Ball figures",
                "description": "English product search"
            },
            {
                "text": "Xin chào, bạn có thể giúp tôi không?",
                "description": "Vietnamese greeting"
            },
            {
                "text": "Tôi muốn xem sản phẩm trong danh mục One Piece",
                "description": "Category-based search"
            },
            {
                "text": "Giá của sản phẩm này bao nhiêu?",
                "description": "Price inquiry"
            }
        ]

        for test_case in test_cases:
            try:
                print(f"🔍 Testing: {test_case['description']}")
                print(f"   Input: '{test_case['text']}'")

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
                    response_text = data.get("response_text")
                    products = data.get("product_recommendations", [])

                    print(f"   Intent: {intent}")
                    print(f"   Response: {response_text[:100]}...")
                    print(f"   Products Found: {len(products)}")

                    self.print_result(
                        test_case["description"],
                        True,
                        f"Intent: {intent}, Products: {len(products)}"
                    )
                    self.demo_results.append((test_case["description"], True))
                else:
                    self.print_result(
                        test_case["description"],
                        False,
                        f"Status code: {response.status_code}"
                    )
                    self.demo_results.append((test_case["description"], False))

                time.sleep(0.5)  # Small delay for readability

            except Exception as e:
                self.print_result(
                    test_case["description"],
                    False,
                    f"Error: {str(e)}"
                )
                self.demo_results.append((test_case["description"], False))

    async def demo_product_search(self):
        """Demo voice-based product search"""
        self.print_header("Product Search Demo")

        search_queries = [
            {
                "query": "Naruto figures",
                "description": "Search by character name"
            },
            {
                "query": "Dragon Ball models",
                "description": "Search by series name"
            },
            {
                "query": "sản phẩm giá rẻ",
                "description": "Search by price range"
            }
        ]

        for search_case in search_queries:
            try:
                print(f"🔍 Testing: {search_case['description']}")
                print(f"   Query: '{search_case['query']}'")

                response = requests.get(
                    f"{self.base_url}/voice/products/search",
                    params={"query": search_case["query"]}
                )

                if response.status_code == 200:
                    data = response.json()
                    products = data.get("products", [])
                    total_found = data.get("total_found", 0)

                    print(f"   Total Found: {total_found}")
                    if products:
                        print(
                            f"   Top Result: {products[0].get('name', 'Unknown')}")
                        print(
                            f"   Category: {products[0].get('category', {}).get('name', 'Unknown')}")
                        print(f"   Price: {products[0].get('price', 0):,} VND")

                    self.print_result(
                        search_case["description"],
                        True,
                        f"Found {len(products)} products"
                    )
                    self.demo_results.append(
                        (search_case["description"], True))
                else:
                    self.print_result(
                        search_case["description"],
                        False,
                        f"Status code: {response.status_code}"
                    )
                    self.demo_results.append(
                        (search_case["description"], False))

                time.sleep(0.5)

            except Exception as e:
                self.print_result(
                    search_case["description"],
                    False,
                    f"Error: {str(e)}"
                )
                self.demo_results.append((search_case["description"], False))

    async def demo_product_categories(self):
        """Demo product categories endpoint"""
        self.print_header("Product Categories Demo")

        try:
            response = requests.get(
                f"{self.base_url}/voice/products/categories")

            if response.status_code == 200:
                data = response.json()
                categories = data.get("categories", [])
                total = data.get("total", 0)

                print(f"📂 Total Categories: {total}")
                print("   Available Categories:")
                # Show first 8
                for i, category in enumerate(categories[:8], 1):
                    print(f"   {i}. {category.get('name', 'Unknown')}")
                if len(categories) > 8:
                    print(f"   ... and {len(categories) - 8} more")

                self.print_result(
                    "Product Categories",
                    True,
                    f"Found {total} categories"
                )
                self.demo_results.append(("Product Categories", True))
            else:
                self.print_result(
                    "Product Categories",
                    False,
                    f"Status code: {response.status_code}"
                )
                self.demo_results.append(("Product Categories", False))
        except Exception as e:
            self.print_result(
                "Product Categories",
                False,
                f"Error: {str(e)}"
            )
            self.demo_results.append(("Product Categories", False))

    async def demo_product_recommendations(self):
        """Demo product recommendations"""
        self.print_header("Product Recommendations Demo")

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
                print(f"🔍 Testing: {test_case['description']}")

                params = {"intent": test_case["intent"]}
                if "category" in test_case:
                    params["category"] = test_case["category"]
                if "price_max" in test_case:
                    params["price_max"] = test_case["price_max"]

                response = requests.get(
                    f"{self.base_url}/voice/products/recommendations",
                    params=params
                )

                if response.status_code == 200:
                    data = response.json()
                    recommendations = data.get("recommendations", [])
                    total = data.get("total", 0)

                    print(f"   Intent: {test_case['intent']}")
                    print(f"   Total Recommendations: {total}")
                    if recommendations:
                        print(
                            f"   Top Recommendation: {recommendations[0].get('name', 'Unknown')}")

                    self.print_result(
                        test_case["description"],
                        True,
                        f"Found {len(recommendations)} recommendations"
                    )
                    self.demo_results.append((test_case["description"], True))
                else:
                    self.print_result(
                        test_case["description"],
                        False,
                        f"Status code: {response.status_code}"
                    )
                    self.demo_results.append((test_case["description"], False))

                time.sleep(0.5)

            except Exception as e:
                self.print_result(
                    test_case["description"],
                    False,
                    f"Error: {str(e)}"
                )
                self.demo_results.append((test_case["description"], False))

    async def demo_chatbot_integration(self):
        """Demo chatbot integration via voice agent"""
        self.print_header("Chatbot Integration Demo")

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
                print(f"🔍 Testing: {test_case['description']}")
                print(f"   Query: '{test_case['text']}'")

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

                    print(f"   Chatbot Response: {bool(chatbot_response)}")
                    if chatbot_response:
                        print(
                            f"   Response Type: {type(chatbot_response).__name__}")

                    self.print_result(
                        test_case["description"],
                        True,
                        f"Response received: {bool(chatbot_response)}"
                    )
                    self.demo_results.append((test_case["description"], True))
                else:
                    self.print_result(
                        test_case["description"],
                        False,
                        f"Status code: {response.status_code}"
                    )
                    self.demo_results.append((test_case["description"], False))

                time.sleep(0.5)

            except Exception as e:
                self.print_result(
                    test_case["description"],
                    False,
                    f"Error: {str(e)}"
                )
                self.demo_results.append((test_case["description"], False))

    async def demo_voice_streaming(self):
        """Demo real-time voice response streaming"""
        self.print_header("Voice Streaming Demo")

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
                print(f"🔍 Testing: {test_case['description']}")
                print(f"   Query: '{test_case['query']}'")

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

                    print(
                        f"   Response Length: {len(response_text) if response_text else 0} chars")
                    print(f"   Products Found: {len(products)}")
                    print(f"   Suggested Actions: {len(suggested_actions)}")

                    self.print_result(
                        test_case["description"],
                        True,
                        f"Response: {len(response_text) if response_text else 0} chars, Products: {len(products)}"
                    )
                    self.demo_results.append((test_case["description"], True))
                else:
                    self.print_result(
                        test_case["description"],
                        False,
                        f"Status code: {response.status_code}"
                    )
                    self.demo_results.append((test_case["description"], False))

                time.sleep(0.5)

            except Exception as e:
                self.print_result(
                    test_case["description"],
                    False,
                    f"Error: {str(e)}"
                )
                self.demo_results.append((test_case["description"], False))

    async def run_demo(self):
        """Run the complete demo suite"""
        print("🚀 Enhanced Voice Agent Demo Suite")
        print("=" * 60)
        print("This demo showcases the enhanced voice agent capabilities:")
        print("• Text processing with chatbot integration")
        print("• Voice-based product search")
        print("• Product categories and recommendations")
        print("• Chatbot integration via voice agent")
        print("• Real-time voice streaming")
        print("=" * 60)

        # Run all demos
        await self.demo_health_check()
        await self.demo_text_processing()
        await self.demo_product_search()
        await self.demo_product_categories()
        await self.demo_product_recommendations()
        await self.demo_chatbot_integration()
        await self.demo_voice_streaming()

        # Print demo summary
        self.print_header("Demo Summary")

        total_demos = len(self.demo_results)
        successful_demos = sum(1 for result in self.demo_results if result[1])
        failed_demos = total_demos - successful_demos

        print(f"📊 Total Demos: {total_demos}")
        print(f"✅ Successful: {successful_demos}")
        print(f"❌ Failed: {failed_demos}")
        print(f"🎯 Success Rate: {(successful_demos/total_demos)*100:.1f}%")

        if failed_demos > 0:
            print("\n❌ Failed Demos:")
            for result in self.demo_results:
                if not result[1]:
                    print(f"  - {result[0]}")

        print("\n🎉 Demo completed!")
        print("💡 Check the API documentation at: http://localhost:8000/docs")
        print("📚 Read the full documentation in README_ENHANCED.md")


def main():
    """Main function to run the demo"""
    demo = EnhancedVoiceAgentDemo()

    try:
        # Run demo
        asyncio.run(demo.run_demo())

    except KeyboardInterrupt:
        print("\n⏹️  Demo interrupted by user.")
    except Exception as e:
        print(f"\n💥 Demo failed with error: {str(e)}")


if __name__ == "__main__":
    main()
