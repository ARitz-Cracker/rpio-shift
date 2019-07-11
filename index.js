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
		this.currentValue = 0b00000000;
		this.io[0].open(this.pins[0], rpio.OUTPUT);
		this.io[1].open(this.pins[1], rpio.OUTPUT);
		if (this.pins[2] != null){
			options.io[2].open(options.pins[2], rpio.OUTPUT);
		}
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
	writeByte(values){
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
		if (this.currentValue === newValue){
			return;
		}
		this.currentValue = (this.currentValue & pinsToKeep) | newValue;
		this.pulse(((this.currentValue & 0b10000000) > 0) | 0);
		this.pulse(((this.currentValue & 0b01000000) > 0) | 0);
		this.pulse(((this.currentValue & 0b00100000) > 0) | 0);
		this.pulse(((this.currentValue & 0b00010000) > 0) | 0);
		this.pulse(((this.currentValue & 0b00001000) > 0) | 0);
		this.pulse(((this.currentValue & 0b00000100) > 0) | 0);
		this.pulse(((this.currentValue & 0b00000010) > 0) | 0);
		this.pulse(((this.currentValue & 0b00000001) > 0) | 0);
		this.apply();
	}
	write(pin, state){
		let thing = [];
		thing[pin] = state;
		this.writeByte(thing)
	}
}
module.exports = {ShiftRegister};