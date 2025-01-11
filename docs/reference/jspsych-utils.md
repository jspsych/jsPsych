# jsPsych.utils

The jsPsych.utils module contains utility functions that might turn out useful at one place or the other.

---

## jsPsych.utils.unique

```javascript
jsPsych.utils.unique(array)
```

### Parameters

| Parameter | Type  | Description                    |
| --------- | ----- | ------------------------------ |
| array     | Array | An array of arbitrary elements |

### Return value

An array containing all elements from the input array, but without duplicate elements

### Description

This function takes an array and returns a copy of that array with all duplicate elements removed.

### Example

```javascript
jsPsych.utils.unique(["a", "b", "b", 1, 1, 2]) // returns ["a", "b", 1, 2]
```

---

## jsPsych.utils.deepCopy

```javascript
jsPsych.utils.deepCopy(object);
```

### Parameters

| Parameter | Type            | Description                  |
| --------- | --------------- | ---------------------------- |
| object    | Object or Array | An arbitrary object or array |

### Return value

A deep copy of the provided object or array

### Description

This function takes an arbitrary object or array and returns a deep copy of it, i.e. all child objects or arrays are recursively copied too.

### Example

```javascript
var myObject = { nested: ["array", "of", "elements"] };
var deepCopy = jsPsych.utils.deepCopy(myObject);
deepCopy.nested[2] = "thingies";
console.log(myObject.nested[2]) // still logs "elements"
```

---

## jsPsych.utils.deepMerge

```javascript
jsPsych.utils.deepMerge(object1, object2);
```

### Parameters

| Parameter | Type   | Description     |
| --------- | ------ | --------------- |
| object1   | Object | Object to merge |
| object2   | Object | Object to merge |

### Return value

A deep copy of `object1` with all the (nested) properties from `object2` filled in

### Description

This function takes two objects and recursively merges them into a new object. If both objects define the same (nested) property, the property value from `object2` takes precedence.

### Example

```javascript
var object1 = { a: 1, b: { c: 1, d: 2 } };
var object2 = { b: { c: 2 }, e: 3 };
jsPsych.utils.deepMerge(object1, object2); // returns { a: 1, b: { c: 2, d: 2 }, e: 3 }
```
