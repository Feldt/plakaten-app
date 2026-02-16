#!/bin/bash
EAS_SKIP_AUTO_FINGERPRINT=1 eas update --branch production --platform ios --message "${1:-update}"
