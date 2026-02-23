import { v4 as uuidv4 } from 'uuid';

export const mockUsers = [
    {
        id: "demo-user-123", // This matches the DEMO_USER in useAuth
        full_name: "Demo Cliente Plata",
        first_name: "Demo",
        last_name: "Cliente",
        phone: "+52 555 123 4567",
        birth_date: "1990-05-15",
        client_number: 1001,
        total_races: 15,
        current_level_id: 2, // Plata
        is_permanent_level: false,
        levels: { name: "Plata", color: "bg-gray-400" },
        hasActiveMembership: true
    },
    {
        id: "dummy-user-1",
        full_name: "Carlos Sainz",
        first_name: "Carlos",
        last_name: "Sainz",
        phone: "+52 555 987 6543",
        birth_date: "1994-09-01",
        client_number: 1002,
        total_races: 8,
        current_level_id: 1, // Bronce
        is_permanent_level: false,
        levels: { name: "Bronce", color: "bg-orange-700" },
        hasActiveMembership: false
    },
    {
        id: "dummy-user-2",
        full_name: "Max Verstappen",
        first_name: "Max",
        last_name: "Verstappen",
        phone: "+52 555 111 2222",
        birth_date: "1997-09-30",
        client_number: 1003,
        total_races: 105,
        current_level_id: 5, // Master
        is_permanent_level: true,
        levels: { name: "Master", color: "bg-black text-white" },
        hasActiveMembership: true
    },
    {
        id: "dummy-user-3",
        full_name: "Checo Pérez",
        first_name: "Sergio",
        last_name: "Pérez",
        phone: "+52 333 444 5555",
        birth_date: "1990-01-26",
        client_number: 1004,
        total_races: 45,
        current_level_id: 3, // Oro
        is_permanent_level: false,
        levels: { name: "Oro", color: "bg-yellow-500" },
        hasActiveMembership: true
    },
];

export const mockLevels = [
    { id: 1, name: "Bronce", color: "bg-orange-700", min_races: 0, renewal_discount: 0 },
    { id: 2, name: "Plata", color: "bg-gray-400", min_races: 10, renewal_discount: 10 },
    { id: 3, name: "Oro", color: "bg-yellow-500", min_races: 30, renewal_discount: 20 },
    { id: 4, name: "Platino", color: "bg-slate-300", min_races: 60, renewal_discount: 30 },
    { id: 5, name: "Master", color: "bg-black text-white", min_races: 100, renewal_discount: 50 },
];

export const mockCoupons = [
    {
        id: uuidv4(),
        code: "DEMO-WELC",
        is_used: false,
        valid_until: "2026-12-31",
        user_id: "demo-user-123",
        source: "welcome",
        full_name: "Demo Cliente Plata",
        client_number: 1001,
        name: "Cupón de Bienvenida",
        discount_value: 50,
        discount_type: "percentage",
        coupon_templates: { name: "Bienvenida", discount_value: 50, discount_type: "percentage" }
    },
    {
        id: uuidv4(),
        code: "DEMO-BIRT",
        is_used: true,
        valid_until: "2026-05-31",
        user_id: "demo-user-123",
        source: "birthday",
        full_name: "Demo Cliente Plata",
        client_number: 1001,
        name: "Cupón de Cumpleaños",
        discount_value: 1,
        discount_type: "free_race",
        coupon_templates: { name: "Cumpleaños", discount_value: 1, discount_type: "free_race" }
    }
];

export const mockMemberships = [
    {
        id: uuidv4(),
        user_id: "demo-user-123",
        start_date: "2026-01-01",
        end_date: "2026-12-31",
        status: "active"
    }
];

export const mockPointRewards = [
    { id: uuidv4(), name: "1 Carrera Gratis", description: "Válido de Lunes a Domingo", points_required: 150, reward_type: "free_race", reward_value: 1, is_active: true, created_at: new Date().toISOString() },
    { id: uuidv4(), name: "3 Carreras Gratis", description: "Válido de Lunes a Domingo", points_required: 400, reward_type: "free_race", reward_value: 3, is_active: true, created_at: new Date().toISOString() },
    { id: uuidv4(), name: "50% Descuento Membresía", description: "Costo normal $300", points_required: 300, reward_type: "membership_discount", reward_value: 50, is_active: true, created_at: new Date().toISOString() },
];

export const mockPointRedemptions = [
    {
        id: uuidv4(),
        points_spent: 150,
        created_at: new Date().toISOString(),
        user_id: "demo-user-123",
        redeemed_by_staff_id: "admin-1",
        reward_id: mockPointRewards[0].id,
        generated_coupon_id: null
    }
];

export const mockRaceLogs = [
    {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        user_id: "demo-user-123",
        staff_id: "admin-1",
        client_name: "Demo Cliente Plata",
        staff_name: "Admin",
        type: "added" as const
    }
];

export const mockCouponTemplates = [
    {
        id: uuidv4(),
        name: "Bienvenida",
        description: "Descuento de 50% en la primera carrera",
        discount_type: "percentage",
        discount_value: 50,
        target_level_id: null,
        valid_until: null,
        is_active: true,
        auto_assign: true,
        levels: null
    },
    {
        id: uuidv4(),
        name: "Cumpleaños",
        description: "1 Carrera Gratis por Cumpleaños",
        discount_type: "free_race",
        discount_value: 1,
        target_level_id: null,
        valid_until: null,
        is_active: true,
        auto_assign: true,
        levels: null
    }
];

export const dsStorage = {
    getUsers: () => {
        const data = localStorage.getItem('demo_users');
        return data ? JSON.parse(data) : mockUsers;
    },
    setUsers: (users: any) => localStorage.setItem('demo_users', JSON.stringify(users)),
    getCoupons: () => {
        const data = localStorage.getItem('demo_coupons');
        return data ? JSON.parse(data) : mockCoupons;
    },
    setCoupons: (coupons: any) => localStorage.setItem('demo_coupons', JSON.stringify(coupons)),
    getMemberships: () => {
        const data = localStorage.getItem('demo_memberships');
        return data ? JSON.parse(data) : mockMemberships;
    },
    getRaceLogs: () => {
        const data = localStorage.getItem('demo_racelogs');
        return data ? JSON.parse(data) : mockRaceLogs;
    },
    setRaceLogs: (logs: any) => localStorage.setItem('demo_racelogs', JSON.stringify(logs)),
    getCouponTemplates: () => {
        const data = localStorage.getItem('demo_coupontemplates');
        return data ? JSON.parse(data) : mockCouponTemplates;
    },
    setCouponTemplates: (templates: any) => localStorage.setItem('demo_coupontemplates', JSON.stringify(templates)),
    getPointRewards: () => {
        const data = localStorage.getItem('demo_pointrewards');
        return data ? JSON.parse(data) : mockPointRewards;
    },
    setPointRewards: (rewards: any) => localStorage.setItem('demo_pointrewards', JSON.stringify(rewards)),
    getPointRedemptions: () => {
        const data = localStorage.getItem('demo_pointredemptions');
        return data ? JSON.parse(data) : mockPointRedemptions;
    },
    setPointRedemptions: (redemptions: any) => localStorage.setItem('demo_pointredemptions', JSON.stringify(redemptions)),
    initialize: () => {
        if (!localStorage.getItem('demo_users')) dsStorage.setUsers(mockUsers);
        if (!localStorage.getItem('demo_coupons')) dsStorage.setCoupons(mockCoupons);
        if (!localStorage.getItem('demo_memberships')) localStorage.setItem('demo_memberships', JSON.stringify(mockMemberships));
        if (!localStorage.getItem('demo_racelogs')) dsStorage.setRaceLogs(mockRaceLogs);
        if (!localStorage.getItem('demo_coupontemplates')) dsStorage.setCouponTemplates(mockCouponTemplates);
        if (!localStorage.getItem('demo_pointrewards')) dsStorage.setPointRewards(mockPointRewards);
        if (!localStorage.getItem('demo_pointredemptions')) dsStorage.setPointRedemptions(mockPointRedemptions);
    }
};

dsStorage.initialize();
