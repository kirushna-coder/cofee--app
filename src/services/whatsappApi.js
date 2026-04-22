/**
 * CoFee App - WhatsApp Business Cloud API Service
 * Handles direct automated messaging via Meta Graph API.
 */

const WhatsappApiService = {
    getConfig() {
        const data = StorageService.getData();
        return data.apiConfig || {
            enabled: false,
            phoneNumberId: '',
            accessToken: '',
            version: 'v21.0'
        };
    },

    saveConfig(config) {
        const data = StorageService.getData();
        data.apiConfig = config;
        StorageService.saveData(data);
    },

    async sendMessage(to, message) {
        const config = this.getConfig();
        if (!config.enabled || !config.phoneNumberId || !config.accessToken) {
            console.warn('WhatsApp API not configured or enabled.');
            return { success: false, error: 'API Not Configured' };
        }

        // Clean phone number (Meta requires country code, no + or spaces)
        let cleanNumber = to.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;

        const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: cleanNumber,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message
                    }
                })
            });

            const result = await response.json();
            if (response.ok) {
                console.log('WhatsApp API Success:', result);
                return { success: true, data: result };
            } else {
                console.error('WhatsApp API Error:', result);
                return { success: false, error: result.error ? result.error.message : 'Unknown API Error' };
            }
        } catch (error) {
            console.error('WhatsApp API Fetch Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Templates are often required for business-initiated conversations
    async sendTemplate(to, templateName, languageCode = 'en_US', components = []) {
        const config = this.getConfig();
        if (!config.enabled) return { success: false, error: 'API Disabled' };

        let cleanNumber = to.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;

        const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: cleanNumber,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: languageCode },
                        components: components
                    }
                })
            });

            const result = await response.json();
            return response.ok ? { success: true, data: result } : { success: false, error: result.error.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

window.WhatsappApiService = WhatsappApiService;
