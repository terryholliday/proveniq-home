
import { User } from '../lib/types';
import { Timestamp } from 'firebase/firestore';

export const login = async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'test@test.com' && password === 'password') {
        return {
            id: '1',
            uid: '1',
            name: 'Test User',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            preferences: { enableSalesAds: true },
            tier: 'free',
            subscriptionStatus: 'active',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            onboardingCompleted: true,
            isPremium: false,
            aiAccess: true,
            trainingAccess: true,
        };
    }

    throw new Error('Invalid email or password');
};

export const signup = async (name: string, email: string, _password: string): Promise<User> => {
    void _password;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        id: '2',
        uid: '2',
        name,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ')[1] || '',
        email,
        preferences: { enableSalesAds: true },
        tier: 'free',
        subscriptionStatus: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        onboardingCompleted: true,
        isPremium: false,
        aiAccess: true,
        trainingAccess: true,
    };
};

export const updateUser = (user: User) => {
    console.log('Mock update user', user);
    return user;
};
