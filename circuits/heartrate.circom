pragma circom 2.0.0;
include "node_modules/circomlib/circuits/comparators.circom";

// HealthTier computes a final category 0, 1, or 2 from four measurables!
template HealthTier() {
    signal input heart_rate;
    signal input systolic;
    signal input diastolic;
    signal input stress;
    
    signal output category;

    // Penalty variables
    component hr_cmp = GreaterEqThan(8);
    hr_cmp.in[0] <== heart_rate;
    hr_cmp.in[1] <== 85; 
    signal hr_penalty <== hr_cmp.out;

    component sys_cmp = GreaterEqThan(9); // BP can go up to 180, so 9 bits is safe (512)
    sys_cmp.in[0] <== systolic;
    sys_cmp.in[1] <== 125;
    signal sys_penalty <== sys_cmp.out;

    component dia_cmp = GreaterEqThan(8);
    dia_cmp.in[0] <== diastolic;
    dia_cmp.in[1] <== 85;
    signal dia_penalty <== dia_cmp.out;

    component str_cmp = GreaterEqThan(8);
    str_cmp.in[0] <== stress;
    str_cmp.in[1] <== 50;
    signal str_penalty <== str_cmp.out;
    
    signal total_penalty <== hr_penalty + sys_penalty + dia_penalty + str_penalty;
    
    // Evaluate Categories
    component is_healthy = IsZero();
    is_healthy.in <== total_penalty;
    
    component is_unhealthy = GreaterEqThan(8);
    is_unhealthy.in[0] <== total_penalty;
    is_unhealthy.in[1] <== 3;

    signal p1 <== 1 - is_healthy.out; 
    signal p2 <== 1 * is_unhealthy.out;
    
    category <== p1 + p2;
}

component main = HealthTier();
