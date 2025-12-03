import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

const firebaseKey = require('../../firebase-key.json');

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseKey),
      });
      this.logger.log('Firebase Admin initialized for notifications');
    }
  }

  async sendPushNotification(token: string, title: string, body: string) {
    const message: admin.messaging.Message = {
      notification: { title, body },
      token,
    };

    await admin.messaging().send(message);
    this.logger.log(`Push notification sent to token ${token}`);
  }
}
