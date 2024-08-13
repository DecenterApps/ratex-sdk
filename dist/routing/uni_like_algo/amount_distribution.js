"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = calculateAmountDistribution;
function calculateAmountDistribution(amountIn, distributionPercentage) {
    const percentages = [];
    const amounts = [];
    for (let i = 1; i <= 100 / distributionPercentage; ++i) {
        percentages.push(distributionPercentage * i);
        amounts.push(amountIn * BigInt(distributionPercentage * i) / BigInt(100));
    }
    return amounts.map((amount, index) => {
        return {
            amountIn: amount,
            percentage: percentages[index]
        };
    });
}
