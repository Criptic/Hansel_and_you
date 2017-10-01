Philips HUE color pattern creation

For create the background environment with lights we had to find the right combination of colors: a cold and sad palette during the story and a warm happy palette for the successful finish.

We selected from pantone examples these groups of colors:
- prison
#545351,#CACAC9,#86A8A8,#7793A3,#233845,#545351,#CACAC9,#86A8A8

- sunshine
#FA7786,#F1C08A,#F5F2B0,#CFE89E   ,#BACF8C,#FA7786,#F1C08A,#F5F2B0

To use the color with the Philips HUE lamps, we hade to proceed with few format conversions and accurate selections to eliminate most of the grey/white component.
To perform the rgb to XY conversion we used the following formula:

function rgb_to_cie(red, green, blue)
{
    //Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
    var red     = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
    var green   = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
    var blue    = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92); 

    //RGB values to XYZ using the Wide RGB D65 conversion formula
    var X       = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    var Y       = red * 0.283881 + green * 0.668433 + blue * 0.047685;
    var Z       = red * 0.000088 + green * 0.072310 + blue * 0.986039;

    //Calculate the xy values from the XYZ values
    var x       = (X / (X + Y + Z)).toFixed(4);
    var y       = (Y / (X + Y + Z)).toFixed(4);

    if (isNaN(x))
        x = 0;

    if (isNaN(y))
        y = 0;   


    return [x, y];
}

The final selection for the 2 groups are the following:

- prison
[ '0.2659', '0.3335' ], [ '0.2542', '0.3003' ], [ '0.2006', '0.2643' ]

- sunshine
[ '0.5316', '0.2978' ], [ '0.4472', '0.3839' ], [ '0.4888', '0.4787' ]

To create a random wave effect for the group colors through our 3 HUE bulbs we created 3 different scene for the cold lights and 2 scenes for the warm and develop a combination of rules to change the scenes, with different timing and controlled by two separate custom sensors to create the loop effect.

Final data:
- lamp group id: 2
- cold sensor id: 3
- cold rules ids: 1, 2, 3
- cold scenes ids: tD4qe8pAqoL8C-, x3eD2gsrIVXxeaX, yPfT4I1UlKOnrGt
- warm sensor id: 4
- warm rules ids: 4, 5
- warm scenes ids: 0afmWTEOUfSM7Bp, qNcMYsG9nkqXRAM
