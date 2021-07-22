powerbrick.onBumperEvent(powerbrick.Ports.PORT1, powerbrick.Slots.B, function () {
    powerbrick.Servo2KG(powerbrick.Servos.S1, 0)
    powerbrick.MotorRun(powerbrick.Motors.M1, 0)
    powerbrick.MP3Play(powerbrick.PrevNext.Stop)
})
powerbrick.onBumperEvent(powerbrick.Ports.PORT1, powerbrick.Slots.A, function () {
    powerbrick.Servo2KG(powerbrick.Servos.S1, 180)
    powerbrick.MotorRun(powerbrick.Motors.M1, 255)
    powerbrick.MP3Play(powerbrick.PrevNext.Play)
})
powerbrick.MP3Connect(powerbrick.SerialPorts.PORT4)
powerbrick.GC_MODE(powerbrick.GCMode.ColorSensor)
basic.forever(function () {
    serial.writeValue("temp", powerbrick.DHT11(powerbrick.Ports.PORT2, powerbrick.DHT11Type.TemperatureF))
    serial.writeValue("humi", powerbrick.DHT11(powerbrick.Ports.PORT2, powerbrick.DHT11Type.Humidity))
    serial.writeValue("ultr", powerbrick.Ultrasonic(powerbrick.Ports.PORT3))
    serial.writeValue("sound", powerbrick.Ultrasonic(powerbrick.Ports.PORT3))
    serial.writeValue("color", powerbrick.GC_Color())
})
