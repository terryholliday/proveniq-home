
import { User } from '../lib/types';

export const login = async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'test@test.com' && password === 'password') {
        return {
            id: '1',
            name: 'Test User',
            email: 'test@test.com',
            preferences: { enableSalesAds: true },
            tier: 'free',
            subscriptionStatus: 'active'
        };
    }

    throw new Error('Invalid email or password');
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        id: '2',
        name,
        email,
        preferences: { enableSalesAds: true },
        tier: 'free',
        subscriptionStatus: 'active'
    };
};

export const updateUser = (user: User) => {
    console.log('Mock update user', user);
    return user;
};
