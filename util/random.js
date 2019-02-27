/*
  Encapsulate useful function for generating random values in the context of TriqoLoto
 */


const { Random, MersenneTwister19937 } = require("random-js");
const random = new Random(MersenneTwister19937.autoSeed());

/*
  Generate a number that is guaranteed to be within [1, 90] without any particular bias.
*/
function generate1To90RandomValue() {
    return random.integer(1, 90);
}

/*
  Generate an array of the given length populated with unique random values
*/
function randomValues(length) {
    const nums = new Set();
    while(nums.size !== length) {
        nums.add(generate1To90RandomValue())
    }
    return Array.from(nums);
}

exports.randomValues = randomValues;
