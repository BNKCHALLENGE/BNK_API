import { Injectable } from '@nestjs/common';

export interface TabItem {
  id: string;
  name: string;
  isActive: boolean;
  hasNotification?: boolean;
}

@Injectable()
export class TabsService {
  private readonly tabs: TabItem[] = [
    { id: 'tab-1', name: '홈', isActive: false },
    { id: 'tab-2', name: '챌린지', isActive: true, hasNotification: true },
    { id: 'tab-3', name: '금융자산', isActive: false },
    { id: 'tab-4', name: '상품가입', isActive: false },
    { id: 'tab-5', name: '설정', isActive: false },
  ];

  getTabs(): TabItem[] {
    return this.tabs;
  }
}
