/*
Riven
load dependency
"backpack": "file:../pxt-backpack"
*/


//% color="#13c2c2" weight=10 icon="\uf1d0"
namespace backpack {

    const PortDigi = [
        [DigitalPin.P8, DigitalPin.P0],
        [DigitalPin.P12, DigitalPin.P1],
        [DigitalPin.P13, DigitalPin.P2],
        [DigitalPin.P15, DigitalPin.P14],
        [DigitalPin.P6, DigitalPin.P3],
        [DigitalPin.P7, DigitalPin.P5],
        [DigitalPin.P9, DigitalPin.P10]
    ]

    const PortAnalog = [AnalogPin.P0, AnalogPin.P1, AnalogPin.P2, null, AnalogPin.P3, AnalogPin.P4, AnalogPin.P10]

    export enum Ports {
        PORT1 = 0,
        PORT2 = 1,
        PORT3 = 2,
        PORT4 = 3,
        PORT5 = 4,
        PORT6 = 5,
        PORT7 = 6
    }

    export enum Slots {
        A = 0,
        B = 1
    }

    let distanceBuf = 0;

    //% blockId=backpack_init block="Backpack Init"
    //% weight=100
    //% blockGap=50
    export function Init(): void {

    }

    //% blockId=backpack_ultrasonic block="Ultrasonic|port %port"
    //% weight=91
    export function Ultrasonic(port: Ports): number {

        // send pulse
        let pin = PortDigi[port][0]
        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pin, 0);

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 25000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && distanceBuf != 0) {
            ret = distanceBuf;
        }
        distanceBuf = d;
        return ret * 10 / 6 / 58;
    }

    //% blockId=backpack_sound block="Sound|port %port"
    //% weight=90
    //% blockGap=50
    export function SoundSensor(port: Ports): number {
        let pin = PortAnalog[port]
        return pins.analogReadPin(pin)
    }

    //% blockId=backpack_tracer block="Tracer|port %port|slot %slot"
    //% weight=80
    export function Tracer(port: Ports, slot: Slots): number {
        let pin = PortDigi[port][slot]
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin)
    }

    //% blockId=backpack_bumper block="Bumper|port %port|slot %slot"
    //% weight=70
    export function Bumper(port: Ports, slot: Slots): number {
        let pin = PortDigi[port][slot]
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin)
    }

}
