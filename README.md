# powerbrick

![](Powerbrick.png)


## Feature

* This extension is designed to programme and drive the moudule series Powerbrick for micro:bit, You can [get Powerbrick From KittenBot](https://www.kittenbot.cc/collections/frontpage/products/powerbrick-10-in-1-robotics-kit-for-microbit)

1. The module adopts a high-quality plastic shell structure, and its size conforms to Lego standards: 3x7 and 7x7. Combining with Lego, you can make different projects quickly and easily and have more fun with programming.

2. The anti-reverse PH2.0 cable is adopted to effectively avoid sensor damage caused by incorrect connection, make it safer to use and reduce the probability of damage and consumption of classroom equipment.

3. A variety of sensors are included, 8 servos and 4 motors can be plugged in the expansion board, which allows children to use their imaginations freely.

4. Most sensors have multiple functions. For example, the ultrasonic module not only has the function of distance measurement, but also has the function of sound intensity detection, so you can now use the most functions with the least wiring.

5. The power supply in the Powerbrick kit adopts 18650 lithium battery, which has a large capacity and can be recharged repeatedly, and the battery box has the functions of anti-reverse connection and over-current protection of the lithium battery, so children can use it safely.


## Basic usage
* The Ultrasonic & Sound sensor module works and feeds back the data of distance and sound to the micro:bit

```blocks

    input.onButtonPressed(Button.A, function () {
        basic.showNumber(powerbrick.Ultrasonic(powerbrick.Ports.PORT1))
    })
    input.onButtonPressed(Button.B, function () {
        basic.showNumber(powerbrick.SoundSensor(powerbrick.PortsA.PORT1))
    })


```

---

* The buzzer sounds when the line tracker module detects a black line

```blocks

    basic.forever(function () {
        if (powerbrick.Tracer(powerbrick.Ports.PORT1, powerbrick.Slots.A) || powerbrick.Tracer(powerbrick.Ports.PORT1, powerbrick.Slots.B)) {
            music.playTone(262, music.beat(BeatFraction.Whole))
        }
    })

```

---

* Press the Bumper and the buzzer will sound

```blocks

    basic.forever(function () {
        if (powerbrick.Bumper(powerbrick.Ports.PORT1, powerbrick.Slots.A) || powerbrick.Bumper(powerbrick.Ports.PORT1, powerbrick.Slots.B)) {
            music.playTone(262, music.beat(BeatFraction.Whole))
        }
    })

```

---

* Temperature and humidity data will be displayed on micro:bit

```blocks

    input.onButtonPressed(Button.A, function () {
        basic.showNumber(powerbrick.DHT11(powerbrick.Ports.PORT1, powerbrick.DHT11Type.TemperatureC))
    })
    
```

---

* Let the servo(grey / limited in -45-225) and the motor(red / limited in -255-255) work.

```blocks

    basic.forever(function () {
        powerbrick.MotorRun(powerbrick.Motors.M1, -255)
        powerbrick.Servo(powerbrick.Servos.S1, -45)
        basic.pause(2000)
        powerbrick.MotorRun(powerbrick.Motors.M1, 255)
        powerbrick.Servo(powerbrick.Servos.S1, 225)
        basic.pause(2000)
    })
    
```

---

* The color & gesture module displays the color(Hue) value on the micro:bit

```blocks

    input.onButtonPressed(Button.A, function () {
        basic.showNumber(powerbrick.GC_Color())
    })
    powerbrick.GC_MODE(powerbrick.GCMode.ColorSensor)

```

---

* The color & gesture module will send 1~4 to the micro:bit means 4 directions, and 0 means no gestrue

```blocks

    let now_ges = 0
    powerbrick.GC_MODE(powerbrick.GCMode.Gesture)
    basic.forever(function () {
        now_ges = powerbrick.GC_Color()
        if (!(now_ges == 0)) {
            basic.showNumber(now_ges)
        }
    })

```

---

* The RFID module detects the RFID card, it will displays the UUID of the card and writes a piece of information to the card

```blocks

    powerbrick.RfidPresent(function () {
        basic.showString(powerbrick.RfidUUID())
        basic.pause(500)
        powerbrick.RfidWrite(powerbrick.RfidSector.S1, powerbrick.RfidBlock.B0, "hello")
        basic.showString(powerbrick.RfidRead(powerbrick.RfidSector.S1, powerbrick.RfidBlock.B0))
    })
    basic.forever(function () {
        powerbrick.RfidProbe()
    })

```

---

* Let the RGB module display

```blocks

input.onButtonPressed(Button.A, function () {
    powerbrick.showColor(powerbrick.colors(powerbrick.NeoPixelColors.Red))
    powerbrick.rgbShow()
})
powerbrick.rgbConnect(powerbrick.Ports.PORT1)

```

---

* MP3 will play mp3 audio stored in the tf card

```blocks

input.onButtonPressed(Button.A, function () {
    powerbrick.MP3Play(powerbrick.PrevNext.Play)
})
powerbrick.MP3Connect(powerbrick.SerialPorts.PORT1)

```


## License

MIT

## Supported targets

* for PXT/microbit
* for PXT/meowbit