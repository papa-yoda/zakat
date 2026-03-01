import type { ApiClient } from './types';
import { createHttpClient } from './httpClient';
import { createLocalClient } from './localClient';

export const isLiteMode = import.meta.env.VITE_MODE === 'lite';

const client: ApiClient = isLiteMode ? createLocalClient() : createHttpClient();

// Re-export all functions for backward compatibility
export const getRetirementAccounts = client.getRetirementAccounts;
export const createRetirementAccount = client.createRetirementAccount;
export const updateRetirementAccount = client.updateRetirementAccount;
export const deleteRetirementAccount = client.deleteRetirementAccount;

export const getInvestments = client.getInvestments;
export const createInvestment = client.createInvestment;
export const updateInvestment = client.updateInvestment;
export const deleteInvestment = client.deleteInvestment;

export const getSavings = client.getSavings;
export const createSavings = client.createSavings;
export const updateSavings = client.updateSavings;
export const deleteSavings = client.deleteSavings;

export const getJewelry = client.getJewelry;
export const createJewelry = client.createJewelry;
export const updateJewelry = client.updateJewelry;
export const deleteJewelry = client.deleteJewelry;

export const getSettings = client.getSettings;
export const updateSettings = client.updateSettings;

export const calculateZakat = client.calculateZakat;

export const getStockPrice = client.getStockPrice;
export const getMetalPrices = client.getMetalPrices;

export const exportData = client.exportData;
export const importData = client.importData;
