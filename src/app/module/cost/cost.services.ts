import AppError from "../../errorHelpers/AppError";
import { ICost, ICreateCost } from "./cost.interface";
import { Cost } from "./cost.model";
import httpStatus from "http-status-codes";

const convertToDaily = (amount: number, period: string) => {
    switch (period) {
        case "day":
            return amount;
        case "week":
            return amount / 7;
        case "month":
            return amount / 30;
        case "year":
            return amount / 365;
        default:
            return amount;
    }
}


const createCost = async (payload: ICreateCost,userId: string) => {
    return await Cost.create({ ...payload, userId });
}

const getAllCosts = async (userId: string) => {
    const costs = await Cost.find({ userId });

    if (!costs) throw new AppError(httpStatus.NOT_FOUND, "No costs found for this user");
let totalDailyCost = 0;
    // return costs.map((cost) => ({
    //     ...cost.toObject(),
    //     dailyEquivalent: convertToDaily(cost.amount, cost.period),
    // }));


    const costsWithDailyEquivalents = costs.map((cost) => {
        const dailyEquivalent = convertToDaily(cost.amount, cost.period);
        totalDailyCost += dailyEquivalent;
        return {
            ...cost.toObject(),
            dailyEquivalent
        };
    });
    return { costs: costsWithDailyEquivalents, totalDailyCost };
}

const getSingleCost = async (id: string) => {
    const cost = await Cost.findById(id);
    if (!cost) throw new AppError(httpStatus.NOT_FOUND, "Cost not found");

    return {
        ...cost.toObject(),
        dailyEquivalent: convertToDaily(cost.amount, cost.period),
    };
}

const updateCost = async (id: string, payload: Partial<ICost>) => {
    const cost = await Cost.findById(id);
    if (!cost) throw new AppError(httpStatus.NOT_FOUND, "Cost not found");
    return await Cost.findByIdAndUpdate(id, payload, { new: true });
}

const deleteCost = async (id: string) => {
    const cost = await Cost.findById(id);
    if (!cost) throw new AppError(httpStatus.NOT_FOUND, "Cost not found");
    return await Cost.findByIdAndDelete(id);
}

export const CostService = {
    createCost,
    getAllCosts,
    getSingleCost,
    updateCost,
    deleteCost
};