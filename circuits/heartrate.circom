pragma circom 2.1.2;

include "node_modules/circomlib/circuits/comparators.circom";

// Circuit to take 1 heart rate and output category.
// < 75 => category 0
// >= 75 and <= 85 => category 1
// > 85 => category 2

template HeartRateTier() {
    signal input heart_rate;
    signal output category;

    component lessThan75 = LessThan(12);
    lessThan75.in[0] <== heart_rate;
    lessThan75.in[1] <== 75;

    component lessThan85 = LessEqThan(12);
    lessThan85.in[0] <== heart_rate;
    lessThan85.in[1] <== 85;

    signal notLessThan75;
    notLessThan75 <== 1 - lessThan75.out;
    
    signal notLessThan85;
    notLessThan85 <== 1 - lessThan85.out;

    signal isCategory1;
    isCategory1 <== notLessThan75 * lessThan85.out;
    
    signal isCategory2;
    isCategory2 <== notLessThan85;
    
    category <== isCategory1 + 2 * isCategory2;
}

component main = HeartRateTier();
