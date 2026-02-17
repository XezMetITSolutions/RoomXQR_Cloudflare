
import { ApiService } from './api';

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
const API_BASE_URL = /\/api\/?$/.test(RAW_API_BASE)
    ? RAW_API_BASE.replace(/\/$/, '')
    : `${RAW_API_BASE.replace(/\/$/, '')}/api`;

export type AnalyticsEventType = 'VIEW_PAGE' | 'CLICK_BUTTON' | 'OPEN_APP' | 'SCAN_QR' | 'ADD_TO_CART';
export type AnalyticsCategory = 'MENU' | 'SERVICES' | 'WIFI' | 'SPA' | 'CLEANING' | 'CONCIERGE' | 'SYSTEM';

export interface AnalyticsEventData {
    eventType: AnalyticsEventType;
    eventCategory: AnalyticsCategory;
    eventLabel?: string;
    eventValue?: number;
    metadata?: Record<string, any>;
    roomId?: string;
}

export interface SurveyData {
    roomId?: string;
    npsScore?: number;
    cleanliness?: number;
    staff?: number;
    comfort?: number;
    facilities?: number;
    wifi?: number;
    food?: number;
    comment?: string;
}

export interface DeviceStatusData {
    roomId: string; // Required to link to a room
    batteryLevel?: number;
    isCharging?: boolean;
    appVersion?: string;
    wifiSignal?: number;
    status?: 'ONLINE' | 'OFFLINE' | 'ERROR';
}

export class AnalyticsService {
    private static getHeaders() {
        // Reusing the header logic ideally, but replicating here for simplicity
        const headers: any = {
            'Content-Type': 'application/json',
        };

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const hostname = window.location.hostname;
            const subdomain = hostname.split('.')[0];
            if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr') {
                headers['x-tenant'] = subdomain;
            }
        }
        return headers;
    }

    /**
     * Genel kullanım takibi (Tıklama, sayfa görüntüleme vb.)
     */
    static async trackEvent(data: AnalyticsEventData): Promise<void> {
        try {
            // Don't await strictly to not block UI
            fetch(`${API_BASE_URL}/analytics/event`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            }).catch(err => console.error('Analytics tracking error:', err));
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    /**
     * Misafir anketi gönderme
     */
    static async submitSurvey(data: SurveyData): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/surveys`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Survey submission failed');
        } catch (error) {
            console.error('Error submitting survey:', error);
            throw error;
        }
    }

    /**
     * Cihaz durumu güncelleme (Heartbeat) - Her 5-10 dakikada bir çağrılmalı
     */
    static async updateDeviceStatus(data: DeviceStatusData): Promise<void> {
        try {
            fetch(`${API_BASE_URL}/devices/status`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            }).catch(err => console.error('Device status update error:', err));
        } catch (error) {
            console.error('Failed to update device status:', error);
        }
    }

    /**
     * Kampanya etkileşimi (Görüntüleme/Tıklama)
     */
    static async trackCampaign(campaignId: string, action: 'view' | 'click'): Promise<void> {
        try {
            fetch(`${API_BASE_URL}/campaigns/${campaignId}/track`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ action }),
            }).catch(err => console.error('Campaign tracking error:', err));
        } catch (error) {
            console.error('Failed to track campaign:', error);
        }
    }
}
