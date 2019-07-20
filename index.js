const rpio = require("rpio");
class ShiftRegister {
	constructor(options){
		/*
		{
			pins[pin, pin, pin]
			io[rpio, rpio, rpio]
		}
		*/
		options.io = options.io || [];
		this.isShiftRegister = true;
		this.pins = [options.pins[0], options.pins[1], options.pins[2]];
		this.io = [options.io[0] || rpio, options.io[1] || rpio, options.io[2] || rpio];
		this.io[0].open(this.pins[0], rpio.OUTPUT);
		this.io[1].open(this.pins[1], rpio.OUTPUT);
		if (this.pins[2] != null){
			this.io[2].open(options.pins[2], rpio.OUTPUT);
		}
		this.rCount = (options.registers | 0) || 1;
		this.currentValues = Buffer.alloc(this.rCount, 0xff)
	}
	open() {

	}
	pulse(state) {
		this.io[0].write(this.pins[0], state);
		this.io[1].write(this.pins[1], rpio.HIGH);
		this.io[1].write(this.pins[1], rpio.LOW);
	}
	apply() {
		if (this.pins[2] == null){return;}
		this.io[2].write(this.pins[2], rpio.HIGH);
		this.io[2].write(this.pins[2], rpio.LOW);
	}
	writeByte(values, register, dontApply){
		register = register | 0;
		let pinsToKeep;
		let newValue = 0b00000000;
		if (Array.isArray(values)){
			for (let i = 0; i < 8; i += 1){
				if (values[i] == null){
					pinsToKeep |= 2 ** i;
				}else if(values[i]){
					newValue |= 2 ** i;
				}
			}
		}else{
			pinsToKeep = 0b00000000;
			newValue = values & 0b11111111;
		}
		
		if (this.currentValues[register] === newValue && this.rCount === 1){
			return;
		}
		
		const currentValue = (this.currentValues[register] & pinsToKeep) | newValue;
		this.pulse(((currentValue & 0b10000000) > 0) | 0);
		this.pulse(((currentValue & 0b01000000) > 0) | 0);
		this.pulse(((currentValue & 0b00100000) > 0) | 0);
		this.pulse(((currentValue & 0b00010000) > 0) | 0);
		this.pulse(((currentValue & 0b00001000) > 0) | 0);
		this.pulse(((currentValue & 0b00000100) > 0) | 0);
		this.pulse(((currentValue & 0b00000010) > 0) | 0);
		this.pulse(((currentValue & 0b00000001) > 0) | 0);
		this.currentValues[register] = currentValue;
		if (!dontApply){
			this.apply();
		}
	}
	writeState(values) {
		if (Array.isArray(values)){
			const bits = this.rCount * 8;
			let register = 0;
			for (let i = 0; i < bits; i += 8){
				this.writeByte(values.slice(i, i + 8), register, true);
				register += 1;
			}
		}else if(values instanceof Uint8Array){
			if (values.length !== this.rCount){
				throw new Error("Length of buffer must equal number of shift registers");
			}
			for (let i = 0; i < values.length; i += 1){
				this.writeByte(values[i], i, true);
			}
		}else if(typeof values === "number"){
			const bits = this.rCount * 8;
			let shiftValue = 0xff;
			let register = 0;
			for (let i = 0; i < bits; i += 8){
				this.writeByte((values & shiftValue) >> i, register, true);
				register += 1;
				shiftValue <<= 8;
			}
		}else if(typeof values === "bigint"){
			const bits = BigInt(this.rCount) * 8n;
			let shiftValue = 0xffn;
			let register = 0;
			for (let i = 0n; i < bits; i += 8n){
				this.writeByte(Number((values & shiftValue) >> i), register, true);
				register += 1;
				shiftValue <<= 8n;
			}
		}else{
			throw new TypeError("Values must be an Array, Buffer, Uint8Array, number, or bigint");
		}
		this.apply();
	}
	write(pin, state){
		let thing = [];
		thing[pin] = state;
		if (this.rCount === 1){
			this.writeByte(thing)
		}else{
			this.writeState(thing)
		}
		
	}
}
module.exports = {ShiftRegister};