/*
Riven
Microbit powerbrick extension board
load dependency
"powerbrick": "file:../pxt-powerbrick"
dht11 port from MonadnockSystems/pxt-dht11
*/


//% color="#13c2c2" weight=10 icon="\uf17b"
namespace powerbrick {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const KC_ADDR = 0x6D
    const KC_VERSION = 0x00
    const KC_MODE = 1
    const KC_READCOLOR = 21
    const KC_READCOLORRAW = 23
    const KC_LEDPWM = 24
    const KC_LEDONOFF = 25
    const KC_LEDBIT = 26
    const KC_PROXIMITY = 31
    const KC_GESTURE = 41

    const PortDigi = [
        [DigitalPin.P8, DigitalPin.P0],
        [DigitalPin.P12, DigitalPin.P1],
        [DigitalPin.P13, DigitalPin.P2],
        [DigitalPin.P15, DigitalPin.P14],
        [DigitalPin.P6, DigitalPin.P3],
        [DigitalPin.P7, DigitalPin.P5],
        [DigitalPin.P9, DigitalPin.P10]
    ]

    const PortSerial = [
        [SerialPin.P8, SerialPin.P0],
        [SerialPin.P12, SerialPin.P1],
        [SerialPin.P13, SerialPin.P2],
        [SerialPin.P15, SerialPin.P14]
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

    export enum SerialPorts {
        PORT1 = 0,
        PORT2 = 1,
        PORT3 = 2,
        PORT4 = 3
    }

    export enum PrevNext {
        Play = 0xaa,
        Next = 0xac,
        Prev = 0xad
    }

    export enum GCLed {
        All = 0,
        LED1 = 1,
        LED2 = 2,
        LED3 = 3,
        LED4 = 4
    }

    export enum Slots {
        A = 0,
        B = 1
    }

    export enum GCOnOff {
        On = 1,
        Off = 0
    }

    export enum DHT11Type {
        Temperature = 0,
        Humidity = 1
    }

    export enum Servos {
        S1 = 8,
        S2 = 9,
        S3 = 10,
        S4 = 11,
        S5 = 12,
        S6 = 13,
        S7 = 14,
        S8 = 15,
        S9 = 7,
        S10 = 6,
        S11 = 5,
        S12 = 4
    }

    export enum Motors {
        M1 = 0x1,
        M2 = 0x2
    }

    export enum BumperEvent {
        Down = DAL.MICROBIT_BUTTON_EVT_DOWN,
        Up = DAL.MICROBIT_BUTTON_EVT_UP,
        Click = DAL.MICROBIT_BUTTON_EVT_CLICK,
    }

    export enum TracerEvent {
        InLine = DAL.MICROBIT_BUTTON_EVT_DOWN,
        OutLine = DAL.MICROBIT_BUTTON_EVT_UP
    }

    export enum GCMode {
        ColorSensor = 0x1,
        Proximity = 0x2,
        Gesture = 0x3
    }

    export enum GCRgb {
        Brightness = 0,
        Red = 1,
        Green = 2,
        Blue = 3
    }

    function dht11Update(pin: DigitalPin): number {
        let loopCnt = 50;
        pins.digitalWritePin(pin, 0)
        basic.pause(20)
        control.waitMicros(40)
        let t = pins.digitalReadPin(pin)
        pins.setPull(pin, PinPullMode.PullUp);

        // Wait for response header to finish
        // dht11 only response every 2s
        while (pins.digitalReadPin(pin) == 1) {
            loopCnt--;
            if (loopCnt == 0) {
                return -1
            }
        };
        while (pins.digitalReadPin(pin) == 0);
        while (pins.digitalReadPin(pin) == 1);
        let value = 0;
        let counter = 0;
        for (let i = 0; i <= 32 - 1; i++) {
            loopCnt = 50;
            while (pins.digitalReadPin(pin) == 0);
            counter = 0
            while (pins.digitalReadPin(pin) == 1) {
                counter += 1;
            }
            if (counter > 4) {
                value = value + (1 << (31 - i));
            }
        }
        // todo: add bit check
        dht11Temp = (value & 0x0000ff00) >> 8;
        dht11Humi = value >> 24;
        return 0;
    }

    let initialized = false
    let distanceBuf = 0;
    let dht11Temp = -1;
    let dht11Humi = -1;

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }


    //% blockId=powerbrick_init block="powerbrick Init"
    //% weight=100
    //% blockGap=50
    export function Init(): void {

    }

    //% blockId=powerbrick_ultrasonic block="Ultrasonic|port %port"
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

    //% blockId=powerbrick_sound block="Sound|port %port"
    //% weight=90
    //% blockGap=50
    export function SoundSensor(port: Ports): number {
        let pin = PortAnalog[port]
        return pins.analogReadPin(pin)
    }

    //% blockId=powerbrick_tracer block="Tracer|port %port|slot %slot"
    //% weight=81
    export function Tracer(port: Ports, slot: Slots): number {
        let pin = PortDigi[port][slot]
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin)
    }

    //% blockId=powerbrick_onTracerEvent block="on Tracer|%port|slot %slot|%event"
    //% weight=80
    //% blockGap=50
    export function onTracerEvent(port: Ports, slot: Slots, event: TracerEvent, handler: Action): void {
        let pin = PortDigi[port][slot]
        control.onEvent(<number>pin, <number>event, handler);
    }

    //% blockId=powerbrick_bumper block="Bumper|port %port|slot %slot"
    //% weight=71
    export function Bumper(port: Ports, slot: Slots): number {
        let pin = PortDigi[port][slot]
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin)
    }

    //% blockId=powerbrick_onBumperEvent block="on Bumper|%port|slot %slot|%event"
    //% weight=70
    export function onBumperEvent(port: Ports, slot: Slots, event: BumperEvent, handler: Action): void {
        let pin = PortDigi[port][slot]
        control.onEvent(<number>pin, <number>event, handler);
    }



    //% blockId=powerbrick_dht11 block="DHT11|port %port|type %readtype"
    //% weight=60
    //% blockGap=50
    export function DHT11(port: Ports, readtype: DHT11Type): number {
        let pin = PortDigi[port][0]
        dht11Update(pin)
        if (readtype == DHT11Type.Temperature) {
            return dht11Temp;
        } else {
            return dht11Humi;
        }
    }

    //% blockId=powerbrick_servo block="Servo|%index|degree %degree"
    //% weight=50
    //% blockGap=50
    //% degree.min=-45 degree.max=225
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Servo(index: Servos, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = ((degree - 90) * 20 / 3 + 1500) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        serial.writeValue("" + index, v_us)
        setPwm(index, 0, value)
    }

    //% blockId=powerbrick_motor_run block="Motor|%index|speed %speed"
    //% weight=44
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(index: Motors, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 16; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 2 || index <= 0)
            return
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }


    //% blockId=powerbrick_motor_dual block="Motor|speed %speed1|speed %speed2"
    //% weight=43
    //% speed1.min=-255 speed1.max=255
    //% speed2.min=-255 speed2.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRunDual(speed1: number, speed2: number): void {
        MotorRun(0, speed1);
        MotorRun(1, speed2);
    }

    //% blockId=powerbrick_motor_rundelay block="Motor|%index|speed %speed|delay %delay|s"
    //% weight=42
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRunDelay(index: Motors, speed: number, delay: number): void {
        MotorRun(index, speed);
        basic.pause(delay * 1000);
        MotorRun(index, 0);
    }

    //% blockId=powerbrick_stop block="Motor Stop|%index|"
    //% weight=41
    export function MotorStop(index: Motors): void {
        MotorRun(index, 0);
    }

    //% blockId=powerbrick_stop_all block="Motor Stop All"
    //% weight=40
    //% blockGap=50
    export function MotorStopAll(): void {
        MotorRun(0, 0);
        MotorRun(1, 0);
    }

    function calcSum(buf: Buffer, start: number, end: number): number {
        let sum = 0;
        for (let i = start; i <= end; i++) {
            sum += buf[i];
        }
        return sum;
    }

    //% blockId=powerbrick_mp3_connect block="MP3 Connect|port %port"
    //% weight=39
    export function MP3Connect(port: SerialPorts): void {
        let pin0 = PortSerial[port][0]
        let pin1 = PortSerial[port][1]
        // todo: fiber may freeze on steam reading
        serial.redirect(pin1, SerialPin.P16, BaudRate.BaudRate9600)
    }

    //% blockId=powerbrick_mp3_play block="MP3 Play|%PrevNext"
    //% weight=38
    export function MP3Play(pn: PrevNext): void {
        let buf = pins.createBuffer(5);
        buf[0] = 0x7e;
        buf[1] = 0x03;
        buf[2] = pn;
        buf[3] = buf[1] + buf[2];
        buf[4] = 0xef;
        serial.writeBuffer(buf)
    }

    //% blockId=powerbrick_mp3_volumn block="MP3 Volumn|%volumn"
    //% volumn.min=0 volumn.max=31
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% weight=37
    export function MP3Volumn(volumn: number): void {
        let buf = pins.createBuffer(6);
        buf[0] = 0x7e;
        buf[1] = 0x04;
        buf[2] = 0xae;
        buf[3] = volumn;
        buf[4] = calcSum(buf, 1, 3);
        buf[5] = 0xef;
        serial.writeBuffer(buf)
    }

    //% blockId=powerbrick_mp3_playindex block="MP3 Play Index|%index"
    //% weight=37
    export function MP3PlayIndex(index: number): void {
        let buf = pins.createBuffer(7);
        if (index == 0) {
            index = 1;
        }
        buf[0] = 0x7e;
        buf[1] = 0x05;
        buf[2] = 0xa2;
        buf[3] = 0;
        buf[4] = index;
        buf[5] = calcSum(buf, 1, 4);
        buf[6] = 0xef;
        serial.writeBuffer(buf)
    }

    //% blockId=powerbrick_mp3_playname block="MP3 Play Name|%name"
    //% weight=36
    //% blockGap=50
    export function MP3PlayName(str: string): void {
        let len = str.length;
        if (len > 8) len = 8;
        let buf = pins.createBuffer(len + 5);
        buf[0] = 0x7e;
        buf[1] = len + 3;
        buf[2] = 0xa3;
        for (let i = 0; i < len; i++) {
            buf[3 + i] = str.charCodeAt(i);
        }
        buf[len + 3] = calcSum(buf, 1, len + 2);
        buf[len + 4] = 0xef;
        serial.writeBuffer(buf)
    }

    //% blockId=powerbrick_gc_mode block="Gesture/Color mode|%mode"
    //% weight=29
    export function GC_MODE(mode: GCMode): void {
        i2cwrite(KC_ADDR, KC_MODE, mode);
    }

    //% blockId=powerbrick_gc_color block="Gesture/Color Color"
    //% weight=28
    export function GC_Color(): number {
        pins.i2cWriteNumber(KC_ADDR, KC_READCOLOR, NumberFormat.UInt8BE);
        let buff = pins.i2cReadBuffer(KC_ADDR, 2);
        return buff[0] * 2;
    }

    //% blockId=powerbrick_gc_brightness block="Gesture/Color Brightness"
    //% weight=27
    export function GC_Brightness(): number {
        pins.i2cWriteNumber(KC_ADDR, KC_READCOLOR, NumberFormat.UInt8BE);
        let buff = pins.i2cReadBuffer(KC_ADDR, 2);
        return buff[1];
    }

    //% blockId=powerbrick_gc_ledpwm block="Gesture/Color LED Brightness|%pwm"
    //% pwm.min=0 pwm.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% weight=26
    export function GC_LEDPWM(pwm: number): void {
        i2cwrite(KC_ADDR, KC_LEDPWM, pwm);
    }

    //% blockId=powerbrick_gc_ledonoff block="Gesture/Color LED|%index|On/Off %onoff"
    //% weight=25
    export function GC_LEDONOFF(index: GCLed, onoff: GCOnOff): void {
        let buf = pins.createBuffer(3)
        buf[0] = KC_LEDONOFF
        buf[1] = index
        buf[2] = onoff
        pins.i2cWriteBuffer(KC_ADDR, buf)
        basic.pause(1)
    }

    //% blockId=powerbrick_gc_ledbit block="Gesture/Color LED1 %l1 |LED2 %l2 |LED3 %l3 |LED4 %l4"
    //% weight=24
    export function GC_LEDBIT(l1: GCOnOff, l2: GCOnOff, l3: GCOnOff, l4: GCOnOff): void {
        let buf = pins.createBuffer(2)
        buf[0] = KC_LEDBIT
        buf[1] = l1 * 1 + l2 * 2 + l3 * 4 + l4 * 8;       
        pins.i2cWriteBuffer(KC_ADDR, buf)
        basic.pause(1)
    }

    //% blockId=powerbrick_gc_proximity block="Gesture/Color Proximity"
    //% weight=23
    export function GC_PROXIMITY(): number {
        return i2cread(KC_ADDR, KC_PROXIMITY)
    }

    //% blockId=powerbrick_gc_gesture block="Gesture/Color last gesture"
    //% weight=22
    export function GC_Gesture(): number {
        return i2cread(KC_ADDR, KC_GESTURE)
    }

    //% blockId=powerbrick_gc_rgb block="Gesture/Color RGB|%rgb"
    //% weight=21
    export function GC_RGB(rgb: GCRgb): number {
        pins.i2cWriteNumber(KC_ADDR, KC_READCOLORRAW, NumberFormat.UInt8BE);
        let buff = pins.i2cReadBuffer(KC_ADDR, 4);
        return buff[rgb];
    }

}
