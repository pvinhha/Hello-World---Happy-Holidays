# Hello-World---Happy-Holidays
A Misty Robot embedded Java program to say "Hello World" as well as to greet the coming seasonal holidays
For robot model: Misty II from Misty Robotics
Software requirements: 
  - Use Skill Runner provided by Misty Robotics to upload this program to Misty robot to run
  - Use Command center provided by Misty Robotics to upload the audio files to Misty to be used with this program

Features:
 - Battery health check to allow all functions to run
 - Using the available API functions to make the head and arm moves for 
   live-like poses
 - LEDs usage with multiple colors setting in the sensors' callbacks
 - Play audio for greeting - Hello World with holiday season messages
 
 Misty will regularly have the battery level check and will stop performing if power is lower than healthy threshold.
 Misty will greet the "Hello World and holiday greeting" messages, then remain running in loop unless terminated by the skill
 runner.  Pressing any bump sensor will let Misty restart the "Hello World" skill.
 
 A Video demo of this skill can be view at: https://youtu.be/qZoyiwezxog
 
