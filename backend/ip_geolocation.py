"""
IP Geolocation Service for Analytics API
Detects user country from IP address
"""

import requests
from flask import request
import json


class IPGeolocationService:
    """Service to detect country from IP address"""

    def __init__(self):
        # Free IP geolocation APIs
        self.services = [
            {
                "name": "ipapi.co",
                "url": "https://ipapi.co/{ip}/json/",
                "country_field": "country_name"
            },
            {
                "name": "ip-api.com",
                "url": "http://ip-api.com/json/{ip}",
                "country_field": "country"
            }
        ]

    def get_client_ip(self):
        """Get the real IP address of the client"""
        # Check for forwarded IP first
        if request.headers.get('X-Forwarded-For'):
            # X-Forwarded-For can contain multiple IPs, take the first one
            ip = request.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request.headers.get('X-Real-IP'):
            ip = request.headers.get('X-Real-IP')
        else:
            # Direct connection
            ip = request.remote_addr

        # Handle localhost/development cases
        if ip in ['127.0.0.1', 'localhost', '::1']:
            print("🌐 Development mode - using demo IP for testing")
            return "8.8.8.8"  # Google DNS IP for testing (US location)

        return ip

    def get_country_from_ip(self, ip_address=None):
        """
        Get country name from IP address

        Args:
            ip_address: IP to lookup (if None, detects from request)

        Returns:
            str: Country name or None if detection failed
        """
        if ip_address is None:
            ip_address = self.get_client_ip()

        print(f"🌍 Looking up country for IP: {ip_address}")

        for service in self.services:
            try:
                country = self._try_service(service, ip_address)
                if country:
                    print(f"✅ IP geolocation successful via {service['name']}: {country}")
                    return country

            except Exception as e:
                print(f"⚠️ IP service {service['name']} failed: {str(e)}")
                continue

        print("❌ All IP geolocation services failed")
        return None

    def _try_service(self, service, ip_address):
        """Try a specific geolocation service"""
        url = service["url"].format(ip=ip_address)

        response = requests.get(url, timeout=3)

        if response.status_code == 200:
            data = response.json()

            country = data.get(service["country_field"])

            if country and country != "Unknown" and len(country) > 1:
                return country

        return None

    def get_country_with_fallback(self, client_country=None):
        """
        Get country using hybrid approach: IP geolocation + client fallback

        Args:
            client_country: Country detected by client (from locale)

        Returns:
            dict: Contains country, detection_method, and confidence
        """

        # Try IP geolocation first
        ip_country = self.get_country_from_ip()

        if ip_country:
            result = {
                "country": ip_country,
                "detection_method": "ip_geolocation",
                "confidence": "high",
                "ip_country": ip_country,
                "client_country": client_country
            }

            return result

        else:
            # IP geolocation failed, use client fallback
            if client_country and client_country != "Unknown":
                return {
                    "country": client_country,
                    "detection_method": "locale_fallback",
                    "confidence": "low",
                    "ip_country": None,
                    "client_country": client_country
                }
            else:
                return {
                    "country": "Unknown",
                    "detection_method": "failed",
                    "confidence": "none",
                    "ip_country": None,
                    "client_country": client_country
                }


ip_geo_service = IPGeolocationService()