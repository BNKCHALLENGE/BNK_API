import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

const firebaseKey = JSON.parse(process.env.FIREBASE_KEY ?? '{}');

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor() {
    this.ensureInitialized();
  }

  async sendPushNotification(token: string, title: string, body: string) {
    const message: admin.messaging.Message = {
      notification: { title, body },
      token,
    };

    await admin.messaging().send(message);
    this.logger.log(`Push notification sent to token ${token}`);
  }

  async sendBulkNotification(tokens: string[], title: string, body: string): Promise<void> {
    const validTokens = tokens.filter((token) => !!token);
    const tasks = validTokens.map((token) =>
      this.sendPushNotification(token, title, body).catch((error) => {
        this.logger.error(`Failed to send notification to token ${token}`, error as any);
      }),
    );
    await Promise.all(tasks);
  }

  private ensureInitialized() {
    if (admin.apps.length) {
      return;
    }
    try {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseKey),
      });
      this.logger.log('Firebase Admin initialized for notifications');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error as any);
      throw error;
    }
  }
}
