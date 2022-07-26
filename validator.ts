
/**
 * For example, a schema that looks like 
 * { type: "object", properties: { name: { type: "string" } } }
 * will match { name: "Kevin" } or {} but should fail { name: 5 } and { hello: "world" }
 * 
 * Required fields must be listed
 */
// type ObjectSchema = {
//     type: 'object';
//     properties: Record<
//         string, 
//         stringSchema | numberSchema | booleanSchema | ObjectSchema | ArraySchema
//     >
//     required?: string[]
// }

/**
 * A schema that looks like this:
 * { type: "array", items: { type: object, properties: { a: { type: number } } } }
 * will match: [{a: 5},  {a: 2}, {a: 10}] but won't match [{a: 5}, {a: 'hello'}]
 */
// type ArraySchema = {
//     type: 'array';
//     items: stringSchema | numberSchema | booleanSchema | ObjectSchema | ArraySchema
// }

function validator(data, schema) {

    //base case: if data is not of the same type as the schema type, return false
    if ((typeof data !== schema.type) && !(data instanceof Array)) {
        return false
    }

    if ((data instanceof Array) && schema.type !== "array") {
        return false
    }

    // if data is of the correct schema type
    // check if the properties of the schema hold true
    // if string, want to check enums, if array, want to check item types, if object, check properties and required

    if (schema["type"] === "string" && schema["enum"]) {
        return schema["enum"].includes(data)
    }

    // validate entries in the array
    if (schema["type"] === "array") {
        if (!data.length) {
            return true
        }
        let typeSchema = schema.items
        if (!data.every(el => validator(el, typeSchema))) {
            return false
        }
    }

    //object validation
    if (schema["type"] === "object") {
        if (!Object.keys(data).length && !schema.required) {
            return true
        }

        // check data for all keys in schema, if missing a key, return false;
        let requiredKeys = schema["required"]
        if (requiredKeys) {
            for (let i = 0; i < requiredKeys.length; i++) {
                if (data[requiredKeys[i]] === undefined) {
                    return false
                }
            }
        }

        // check if properties match
        return Object.keys(schema.properties).every(subSchema => {
            return validator(data[subSchema], schema.properties[subSchema])
        })
    }
    
    // if not false, return true
    return true
}

let stringSchema_1 = {
    type: "string"
}

let stringSchema_2 = {
    type: "string",
    enum: ["apple", "banana", "orange"]
}

let numberSchema = {
    type: "number"
}

let booleanSchema = {
    type: "boolean"
}

let arraySchema = {
    type: "array",
    items: booleanSchema
}

let arraySchema_2 = {
    type: "array",
    items: arraySchema
}

let objectSchema = {
    type: "object",
    properties: {
        name: {
            type: "string"
        }
    }
}

let objectSchema_2 = {
    type: "object",
    properties: {
        name: {
            type: "string"
        }
    },
    required: ["name"]
}


console.log(validator("something", stringSchema_1)) // true
console.log(validator("apple", stringSchema_2)) // true
console.log(validator("something", stringSchema_2)) // false
console.log(validator("something", numberSchema)) // false
console.log(validator(12, numberSchema)) // true
console.log(validator(false, booleanSchema)) // true
console.log(validator("false", booleanSchema)) // false
console.log(validator([true, true], arraySchema)) // true
console.log(validator([true, [true]], arraySchema)) // false
console.log(validator([[true]], arraySchema_2)) // true
console.log(validator([true, {hello: "world"}], arraySchema)) //false
console.log(validator({}, objectSchema)) // true
console.log(validator({name: "james"}, objectSchema)) //true
console.log(validator({hello: "world"}, objectSchema)) //false
console.log(validator({hello: "world"}, objectSchema_2)) //false
