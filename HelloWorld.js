//-------------------------------------------------------------------------//
// Misty Hello World skill with - by Phillip Ha 
// First version 11/18/2019
// This skill is created to demonstrate the utilization of 
// the basic support functions.  They can be reused for
// future skills. This skill include
// - Battery health check to allow all functions to run
// - Using the available API functions to make the head and arm moves for 
//   live-like poses
// - LEDs usage with multiple colors setting in the sensors' callbacks
// - Play audio for greeting - Hello World with holiday season messages
//------------------------------------------------------------------------//

// Misty moves in the direction according to the dancing move plan for the music mood/ beat of "I will survive" song 
// uses Time of Flight and Bump Sensors to stop and move away when she gets close to an obstacle

misty.Debug("Initialize head and arms in idle positions");
misty.MoveHead(0, 0, 0, 100);
misty.MoveArms(45, 45, 100, 100);
misty.ChangeLED(0, 255,0);
misty.Pause(2000);

misty.Set("StartTime",(new Date()).toUTCString());
misty.Set("PoseStartAt",(new Date()).toUTCString());
misty.Set("bumpTriggeredAt",(new Date()).toUTCString());
misty.Set("bumpTriggered", false);
misty.Set("timeInDrive", 5);
misty.Set("BatteryCheckMode", 0);
misty.Set("BatteryIsLow",false);
misty.Set("PoseSequenceIndex",0);
misty.Set("PoseFinished",false);

// register the battery monitoring event with the voltage check
registerBatteryMonitoring();
// Register bump sensor monitoring
registerAll();
misty.Pause(2000);
misty.Debug("Start the greeting pose with moving head and arms");

// Misty will regularly have the battery level check and will stop working if power is lower than healthy threshold of 7.6V.
// Misty will greet the "Hello World and holiday greeting" messages, then remain running in loop unless terminated by the skill
// runner.  Pressing any bump sensor will let Misty restart the "Hello World" skill.
// Below is the handling list.
// Everytime a Bump sensor callback is triggered 
// 1. Unregister Bump sensors because we do not want any these sensors to keep triggering the callback indefinitely 
//    until being released 
// 2. After about 4 seconds which it would be a good time for Misty to re-register to Bump Sensors to be ready for
//    the next greeting and posing

while (!misty.Get("BatteryIsLow")) {
    misty.Pause(50);
    if(!misty.Get("PoseFinished")){
        // check for tof sensors ' triggered
        if (misty.Get("bumpTriggered")) {
            if (secondsPast(misty.Get("bumpTriggeredAt")) > 4.0) {
                misty.Set("bumpTriggered", false);
                registerAll();
            }
        }
        
        //OK to start posing after the last move or the callback got enough time to act
        if (secondsPast(misty.Get("PoseStartAt")) > misty.Get("timeInDrive") && !misty.Get("bumpTriggered")) {
            misty.Set("PoseStartAt",(new Date()).toUTCString());
            switch(misty.Get("PoseSequenceIndex")){
                case 0:{
                    misty.MoveHead(0, 10, 0, 90);
                    bothArmsLD_RU();
                    misty.ChangeLED(255, 200,0);
                    misty.PlayAudio("helloworld.wav", 70);
                    misty.Set("PoseSequenceIndex",1);
                    break;
                }
                case 1:{
                    misty.MoveHead(0, 0, 0, 90);
                    misty.Set("PoseSequenceIndex",2);
                    break;
                }
                case 2:{
                    misty.MoveHead(0, -10, 0, 90);
                    bothArmsLU_RD();
                    misty.ChangeLED(0, 0,255);
                    misty.Set("PoseSequenceIndex",3);
                    break;
                }
                case 3:{
                    misty.MoveHead(-10, 0, 0, 100);
                    misty.MoveArms(0, -45, 100, 100);
                    misty.Pause(1000);
                    misty.Set("PoseSequenceIndex",4);
                    break;
                }
                default:{
                    misty.MoveHead(0, 0, 0, 100);
                    misty.MoveArms(45, 45, 100, 100);
                    misty.ChangeLED(0, 200, 0);
                    misty.Pause(2000);
                    misty.Set("PoseFinished",true);
                    misty.Set("PoseSequenceIndex",0);
                    break;
                }
            }
            misty.Set("timeInDrive", 5);
        }
    }
}

// ------------------------------------------Supporting Functions------------------------------------------

//------------------------ Battery monitoring-----------------------------------
//  When the voltage is low, Misty won't be able to drive and taking
//  pictures from 4K and depth camera. A notification will be announced
//  and Misty will stop driving until battery is charged to good level > 7.6V
//------------------------------------------------------------------------------
function registerBatteryMonitoring(){

	if(misty.Get("BatteryCheckMode") == 0){
		misty.AddPropertyTest("BatteryLow", "voltage", "<=", 7.60, "double"); 
		misty.RegisterEvent("BatteryLow", "BatteryCharge", 0, false);
	}
	else if(misty.Get("BatteryCheckMode") == 1){
		misty.AddPropertyTest("BatteryOK", "voltage", ">=", 7.70, "double"); 
		misty.RegisterEvent("BatteryOK", "BatteryCharge", 0, false);
	}
	else{
		misty.AddPropertyTest("BatteryGood", "voltage", ">=", 8.0, "double"); 
		misty.RegisterEvent("BatteryGood", "BatteryCharge", 0, false);
	}
}

function unregisterBatteryMonitoring(){
	if(misty.Get("BatteryCheckMode") == 0){
		try {
			misty.UnregisterEvent("BatteryLow");
		} catch(err) {}
	}
	else if(misty.Get("BatteryCheckMode") == 1){
		try {
			misty.UnregisterEvent("BatteryOK");
		} catch(err) {}
	}
	else{
		try {
			misty.UnregisterEvent("BatteryGood");
		} catch(err) {}
	}
}

//---------------- Handling the Battery Low event -----------------------------
function _BatteryLow(){
	// Terminate the event monitoring so it won't continue triggering until
	// the handling process is done
    misty.Debug("Low battery level detected");
	unregisterBatteryMonitoring();
	misty.PlayAudio("LowBattery.wav", 100);
	misty.Pause(2000);
	// Turn RED LED on
	misty.ChangeLED(255,0,0);
	// Unregister all sensors
	unregisterAll();
	unRegister_HazardNotification();
	misty.Stop();
	misty.Set("BatteryCheckMode",1);
	misty.Set("BatteryIsLow",true);
	registerBatteryMonitoring();
}

function _BatteryOK(){
	// Update the LED color code to indicate the battery level while charging
	unregisterBatteryMonitoring();
	// Turn YELLOW LED on
	misty.ChangeLED(255,255,0);
	misty.Set("BatteryCheckMode",2);
	registerBatteryMonitoring();
}

function _BatteryGood(){
	// Update the LED color code to indicate the battery level while charging
	unregisterBatteryMonitoring();
	// Turn YELLOW LED on
	misty.ChangeLED(0,255,0);
	misty.Set("BatteryCheckMode",0);
	misty.Set("BatteryIsLow",false);
	registerBatteryMonitoring();
}

//------------------- Head arms motion control support functions ---------------------//

function bothArmsLU_RD()
{
    misty.MoveArms(-45, 45, 100, 60);
    misty.Pause(2000);
    misty.MoveArms(45, -45, 100, 60);
}

function bothArmsLD_RU()
{
    misty.MoveArms(45, -45, 100, 60);
    misty.Pause(2000);
    misty.MoveArms(-45, 45, 100, 60);
}

function secondsPast(value) {
	var timeElapsed = new Date() - new Date(value);
    timeElapsed /= 1000;
    return Math.round(timeElapsed); // seconds
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//--------------------------------------Bump Sensor----------------------------------------------------------------

function _Bumped(data) {
	unregisterAll();
	misty.Set("bumpTriggeredAt",(new Date()).toUTCString());
    misty.Set("bumpTriggered", true);
    var sensor = data.AdditionalResults[0];
	misty.Debug(sensor);
	misty.Drive(0,0,0, 200);
    if (sensor === "Bump_FrontRight") {
        misty.Debug("Bump front right sensor was triggered!");
        misty.ChangeLED(0, 255, 0);
    } 
    else if (sensor === "Bump_FrontLeft") {
        misty.Debug("Bump front left sensor was triggered!");
        misty.ChangeLED(255, 200,0);
		misty.Pause(1000);
    } 
    else if (sensor === "Bump_RearLeft") {
        misty.Debug("Bump rear left sensor was triggered!");
        misty.ChangeLED(0, 200,255);
		misty.Pause(1000);
    } 
    else {
        misty.Debug("Bump rear right sensor was triggered!");
        misty.ChangeLED(0, 0,255);
		misty.Pause(1000);
    }

    if(misty.Get("PoseFinished")){
        misty.Set("PoseFinished",false);
        misty.Set("PoseSequenceIndex",0);
    }
}

 //--------------------------------------Easy Register and Unregister Event ----------------------------------------------

function registerAll() {
	// misty.AddPropertyTest(string eventName, string property, string inequality, string valueAsString, string valueType);
    // misty.RegisterEvent(string eventName, string messageType, int debounce, [bool keepAlive = false], [string callbackRule = “synchronous”], [string skillToCall = null]);
    // Event callback function names are event names prefixed with an underscore
	misty.AddReturnProperty("Bumped", "sensorName");
    misty.RegisterEvent("Bumped", "BumpSensor", 250 ,true);

}

function unregisterAll(){
	try {
		misty.UnregisterEvent("Bumped");
	} catch(err) {}
}