# rpio-shift
Control shift-registers from your Rasberry Pi Using JavaScript!

```js
const rpio = require("rpio");
const {ShiftRegister} = require("rpio-shift");

// To control a shift register from the pi itself
const sr = new ShiftRegister({
	// pins: [data, clk, outputLatch]
	pins: [11, 12, 13]
	// How many shift registers you're chaining defaults to 1
	registers: 2
})

// sr.write(outputPin, state)
// outputPin can be any int from 0 to 7
// state can be 0 or 1 (rpio.LOW or rpio.HIGH)
sr.write(0, rpio.HIGH); // Turn on the first output pin
sr.write(7, rpio.Low); // Turn off the last output pin
// If you have multiple shift-registers in a chain, pin 0 is the first output pin in the last shift-register in the chain, pin 8 is the first output pin in the second-last shift-register in the chain, and so on

// sr.writeState(values);
// Sets the state of all the pins in a shift-register chain
sr.writeState(0); // Turn off all outputs
sr.writeState(0b11110000); // Turn off pins 0-3, turn on pins 4-7
sr.writeState([null, 1, 0]); // Don't change the state of pin 0, turn on pin 1, turn off pin 2, don't change the state of other pins
sr.writeState(Buffer.from(0xff, 0x0)); // Turn on all pins on the last shift-register, turn off all pins on the first shift-register
sr.writeState(268435456n) // Turn on the 29th pin in the chain. (Using bigints)

// sr.writeByte(values);
// Takes an 8 bit uint or an array of states
// Do not use this function if you're chaining multiple shift-registers. Use writeState instead.
sr.writeByte(0); // Turn off all outputs
sr.writeByte(0b11110000); // Turn off pins 0-3, turn on pins 4-7
sr.writeByte([null, 1, 0]); // Don't change the state of pin 0, turn on pin 1, turn off pin 2, don't change the state of other pins

// To control a shift register from another shift register
const sr2 = new ShiftRegister({
	pins: [5, 6, 7],
	io: [sr, sr, sr]
});
```