import { api } from './client';

export interface Friend {
  friendshipId: string;
  friend: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    avatar?: string;
  };
  since: string;
}

export interface FriendRequest {
  id: string;
  requester: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface SentRequest {
  id: string;
  addressee: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
}

export const friendsApi = {
  getFriends: async (): Promise<Friend[]> => {
    const response = await api.get('/friends');
    return response.data.data;
  },

  getPendingRequests: async (): Promise<FriendRequest[]> => {
    const response = await api.get('/friends/requests/pending');
    return response.data.data;
  },

  getSentRequests: async (): Promise<SentRequest[]> => {
    const response = await api.get('/friends/requests/sent');
    return response.data.data;
  },

  searchUsers: async (query: string): Promise<UserSearchResult[]> => {
    const response = await api.get('/friends/search', { params: { q: query } });
    return response.data.data;
  },

  sendRequest: async (addresseeId?: string, email?: string): Promise<void> => {
    await api.post('/friends/request', { addresseeId, email });
  },

  acceptRequest: async (requestId: string): Promise<void> => {
    await api.post(`/friends/${requestId}/accept`);
  },

  rejectRequest: async (requestId: string): Promise<void> => {
    await api.post(`/friends/${requestId}/reject`);
  },

  removeFriend: async (friendshipId: string): Promise<void> => {
    await api.delete(`/friends/${friendshipId}`);
  },
};
