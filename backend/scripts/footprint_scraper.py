#!/usr/bin/env python3

import sys
import json
from serpapi import GoogleSearch

PLATFORM_KEYWORDS = {
    "126.com": "126 Mail", "163.com": "163 Mail", "about.me": "About.me", "alibaba.com": "Alibaba",
    "amazon.com": "Amazon", "americanexpress.com": "AmEx", "angellist.com": "AngelList",
    "apple.com": "Apple", "baidu.com": "Baidu", "bandcamp.com": "Bandcamp", "behance.net": "Behance",
    "binance.com": "Binance", "bisq.network": "Bisq", "bitbank.cc": "BitBank", "bitcambio.com.br": "BitCambio",
    "bitfinex.com": "Bitfinex", "bitflyer.com": "Bitflyer", "bitmex.com": "BitMEX", "bitso.com": "Bitso",
    "bitstamp.net": "Bitstamp", "blogspot.com": "Blogger", "blockchain.com": "Blockchain", "box.com": "Box",
    "breached.to": "Breached", "cash.app": "Cash App", "chase.com": "Chase", "citibank.com": "CitiBank",
    "clickup.com": "ClickUp", "codeberg.org": "Codeberg", "codepen.io": "CodePen", "codeproject.com": "CodeProject",
    "coinbase.com": "Coinbase", "coincheck.com": "Coincheck", "coggle.it": "Coggle", "dev.to": "Dev.to",
    "devpost.com": "Devpost", "deribit.com": "Deribit", "discord.com": "Discord", "discover.com": "Discover",
    "dribbble.com": "Dribbble", "dropbox.com": "Dropbox", "ebay.com": "eBay", "evernote.com": "Evernote",
    "facebook.com": "Facebook", "figma.com": "Figma", "flickr.com": "Flickr", "foursquare.com": "Foursquare",
    "ftx.com": "FTX", "gemini.com": "Gemini", "github.com": "GitHub", "gitlab.com": "GitLab", "gmail.com": "Gmail",
    "google.com": "Google", "googleusercontent.com": "Google Files", "goodreads.com": "Goodreads",
    "gravatar.com": "Gravatar", "ghostbin.com": "Ghostbin", "hastebin.com": "Hastebin", "hollaex.com": "HollaEx",
    "hotmail.com": "Hotmail", "huobi.com": "Huobi", "icloud.com": "iCloud", "instagram.com": "Instagram",
    "issuu.com": "Issuu", "jd.com": "JD", "justpaste.it": "JustPaste", "keybase.io": "Keybase", "kraken.com": "Kraken",
    "kucoin.com": "KuCoin", "linkedin.com": "LinkedIn", "live.com": "Live", "localbitcoins.com": "LocalBitcoins",
    "mail.ru": "Mail.ru", "mastercard.com": "MasterCard", "medium.com": "Medium", "meetup.com": "Meetup",
    "mercadobitcoin.com.br": "MercadoBitcoin", "microsoft.com": "Microsoft", "myspace.com": "MySpace",
    "notion.so": "Notion", "okex.com": "OKEx", "outlook.com": "Outlook", "paste.ee": "Paste.ee",
    "pastebin.com": "Pastebin", "paxful.com": "Paxful", "paypal.com": "PayPal", "pinterest.com": "Pinterest",
    "poloniex.com": "Poloniex", "protonmail.com": "ProtonMail", "proton.me": "Proton", "quora.com": "Quora",
    "reddit.com": "Reddit", "researchgate.net": "ResearchGate", "scribd.com": "Scribd", "signal.org": "Signal",
    "sina.com.cn": "Sina", "slack.com": "Slack", "slideshare.net": "SlideShare", "snapchat.com": "Snapchat",
    "sohu.com": "Sohu", "soundcloud.com": "SoundCloud", "squareup.com": "Square", "stackoverflow.com": "Stack Overflow",
    "stripe.com": "Stripe", "taobao.com": "Taobao", "telegram.me": "Telegram", "telegram.org": "Telegram",
    "tencent.com": "Tencent", "tiktok.com": "TikTok", "trello.com": "Trello", "tumblr.com": "Tumblr",
    "twitch.tv": "Twitch", "twitter.com": "Twitter", "usaa.com": "USAA", "venmo.com": "Venmo", "vk.com": "VK",
    "visa.com": "Visa", "vimeo.com": "Vimeo", "weibo.com": "Weibo", "weixin.qq.com": "Weixin",
    "wellsfargo.com": "Wells Fargo", "whatsapp.com": "WhatsApp", "wikipedia.org": "Wikipedia",
    "wordpress.com": "WordPress", "xing.com": "Xing", "yahoo.com": "Yahoo", "yandex.ru": "Yandex",
    "youtube.com": "YouTube", "zaifinance.com": "Zaif", "zellepay.com": "Zelle", "zoho.com": "Zoho"
}

SEARCH_ENGINES = [
    "google",
    "bing",
    "duckduckgo",
    "yahoo"
]

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def build_search_query(identifier, sites):
    sites_query = " OR ".join([f"site:{domain}" for domain in sites])
    return f'"{identifier}" ({sites_query})'

def identify_platform(url):
    for keyword, platform in PLATFORM_KEYWORDS.items():
        if keyword in url:
            return platform
    return "Other"

def search_serpapi(identifier, api_key, engines, chunk_size=8, num_results=10, max_pages=2):
    all_results = []
    for engine in engines:
        for sites_chunk in chunk_list(list(PLATFORM_KEYWORDS.keys()), chunk_size):
            query = build_search_query(identifier, sites_chunk)
            for page in range(max_pages):
                params = {
                    "engine": engine,
                    "q": query,
                    "api_key": api_key,
                    "num": num_results,
                    "hl": "en",
                    "gl": "us"
                }
                if engine == "google":
                    params["start"] = page * num_results
                elif engine == "bing":
                    params["first"] = page * num_results + 1
                elif engine == "yahoo":
                    params["b"] = page * num_results + 1
                elif engine == "duckduckgo":
                    params["start"] = page * num_results

                search = GoogleSearch(params)
                results = search.get_dict()
                for result in results.get("organic_results", []):
                    url = result.get("link", "")
                    all_results.append({
                        "title": result.get("title", ""),
                        "link": url,
                        "platform": identify_platform(url),
                        "snippet": result.get("snippet", ""),
                        "source": result.get("displayed_link", ""),
                        "position": result.get("position", None),
                        "engine": engine
                    })
    # Deduplicate by link
    seen = set()
    deduped = []
    for r in all_results:
        if r["link"] and r["link"] not in seen:
            deduped.append(r)
            seen.add(r["link"])
    return deduped

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python footprint_scraper.py <email_or_identifier> <SERPAPI_KEY>")
        sys.exit(1)

    identifier = sys.argv[1]
    api_key = sys.argv[2]
    try:
        results = search_serpapi(
            identifier,
            api_key,
            SEARCH_ENGINES,
            chunk_size=8,    # Number of sites per query
            num_results=10,  # Results per page
            max_pages=2      # Pages per engine/chunk
        )
        print(json.dumps({
            "email": identifier,
            "results": results,
            "result_count": len(results)
        }, indent=2, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({
            "email": identifier,
            "results": [],
            "error": str(e)
        }, indent=2, ensure_ascii=False))