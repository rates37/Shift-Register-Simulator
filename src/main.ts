import "./style.css";
import { fromEvent, interval, merge } from "rxjs";
import { map, filter, scan, } from 'rxjs/operators';

function main() {
  const CONSTS = {
    OE_ID: "SW_OE",
    OE_LED_ID: "LED_OE",
    OE_TOGGLE_STRING: "OE_TOGGLE",
    OE_SWITCH_GRAPHIC: "SW_OE_Inner",
    OE_SWITCH_UP_Y: "336.8",
    OE_SWITCH_DOWN_Y: "314.123",
    
    SER_ID: "SW_SER",
    SER_LED_ID: "LED_SER",
    SER_TOGGLE_STRING: "SER_TOGGLE",
    SER_SWITCH_GRAPHIC: "SW_SER_Inner",
    SER_SWITCH_UP_Y: "577.811",
    SER_SWITCH_DOWN_Y: "555.134",

    SRCLK_BUTTON_ID: "Button_SRCLK",
    SRCLK_BUTTON_PUSH_STRING: "srclk",
    RCLK_BUTTON_ID: "Button_RCLK",
    RCLK_BUTTON_PUSH_STRING: "rclk",
    SRCLR_BUTTON_ID: "Button_SRCLR",
    SRCLR_BUTTON_PUSH_STRING: "srclr",

    D1_ID: "D_Switch_1",
    D1_TOGGLE_STRING: "D1",
    D1_SWITCH_GRAPHIC: "D_Switch_Inner_1",
    D2_ID: "D_Switch_2",
    D2_TOGGLE_STRING: "D2",
    D2_SWITCH_GRAPHIC: "D_Switch_Inner_2",
    D3_ID: "D_Switch_3",
    D3_TOGGLE_STRING: "D3",
    D3_SWITCH_GRAPHIC: "D_Switch_Inner_3",
    D4_ID: "D_Switch_4",
    D4_TOGGLE_STRING: "D4",
    D4_SWITCH_GRAPHIC: "D_Switch_Inner_4",
    D_SWITCH_UP_Y: "118.339",
    D_SWITCH_DOWN_Y: "140.518",

    LED_ID_ARRAY: ["LED_Qa", "LED_Qb", "LED_Qc", "LED_Qd", "LED_Qe", "LED_Qf", "LED_Qg", "LED_Qh"],

    segments: [
      ["D1_a", "D1_b", "D1_c", "D1_d", "D1_e", "D1_f", "D1_g", "D1_dp"],
      ["D2_a", "D2_b", "D2_c", "D2_d", "D2_e", "D2_f", "D2_g", "D2_dp"],
      ["D3_a", "D3_b", "D3_c", "D3_d", "D3_e", "D3_f", "D3_g", "D3_dp"],
      ["D4_a", "D4_b", "D4_c", "D4_d", "D4_e", "D4_f", "D4_g", "D4_dp"]
    ],


    LED_OFF_STYLE: "fill: rgb(216, 216, 216); stroke: rgb(0, 0, 0);",
    LED_ON_STYLE: "fill: rgb(255, 0, 0); stroke: rgb(0, 0, 0);",

    LED_SRCLR_ID: "LED_SRCLR",
    LED_SRCLK_ID: "LED_SRCLK",
    LED_RCLK_ID: "LED_RCLK"



  };

  type ShiftRegState = Readonly<{
    shiftRegister: Array<boolean>,
    outputRegister: Array<boolean>,
    OEState: boolean,  // whether the OE switch is on/off
    SERState: boolean,  // whether the SER switch is on/off
    dSwitchState: Array<boolean> // stores whether D1, D2, D3 and/or D4 is on
  }>;

  const initialState: ShiftRegState = {
    shiftRegister: [false, false, false, false, false, false, false, false],
    outputRegister: [false, false, false, false, false, false, false, false],

    OEState: true,
    SERState: false,
    dSwitchState: [true, true, true, true]
  };

  const reduceState = (s: ShiftRegState, e: SREvent) => {
    if (e instanceof ButtonPush) {
      if (e.type === CONSTS.OE_TOGGLE_STRING) {
        return {
          ...s,
          OEState: !s.OEState
        }
      } else if (e.type === CONSTS.SER_TOGGLE_STRING) {
        return {
          ...s,
          SERState: !s.SERState
        }
      } else if (e.type === CONSTS.RCLK_BUTTON_PUSH_STRING) {
        return {
          ...s,
          outputRegister: s.shiftRegister
        }
      } else if (e.type === CONSTS.SRCLK_BUTTON_PUSH_STRING) {
        let newShiftRegisterArray = [s.SERState];
        for (let i = 0; i < 7; i++) {
          newShiftRegisterArray.push(s.shiftRegister[i]);
        }
        return {
          ...s,
          shiftRegister: newShiftRegisterArray
        }
      } else if (e.type === CONSTS.SRCLR_BUTTON_PUSH_STRING) {
        return {
          ...s,
          shiftRegister: initialState.outputRegister
        }
      } else if (e.type === CONSTS.D1_TOGGLE_STRING) {
        let currentDArray = s.dSwitchState;
        currentDArray[0] = !currentDArray[0];
        return {
          ...s,
          dSwitchState: currentDArray
        }
      } else if (e.type === CONSTS.D2_TOGGLE_STRING) {
        let currentDArray = s.dSwitchState;
        currentDArray[1] = !currentDArray[1];
        return {
          ...s,
          dSwitchState: currentDArray
        }
      } else if (e.type === CONSTS.D3_TOGGLE_STRING) {
        let currentDArray = s.dSwitchState;
        currentDArray[2] = !currentDArray[2];
        return {
          ...s,
          dSwitchState: currentDArray
        }
      } else if (e.type === CONSTS.D4_TOGGLE_STRING) {
        let currentDArray = s.dSwitchState;
        currentDArray[3] = !currentDArray[3];
        return {
          ...s,
          dSwitchState: currentDArray
        }
      }
      return s;
    }

    return s;
  }

  const updateDisplay = (s: ShiftRegState) => {
    console.log("update");

    // update OE LED:
    const oeLED = document.getElementById(CONSTS.OE_LED_ID) as HTMLElement;
    if (oeLED) {
      if (s.OEState) {
        oeLED.setAttribute("style", CONSTS.LED_ON_STYLE);
      } else {
        oeLED.setAttribute("style", CONSTS.LED_OFF_STYLE);
      }
    }

    // update OE switch graphic:
    const oeSwitch =document.getElementById(CONSTS.OE_SWITCH_GRAPHIC) as HTMLElement;
    if (oeSwitch) {
      if (s.OEState) {
        oeSwitch.setAttribute("y", CONSTS.OE_SWITCH_DOWN_Y);
      } else {
        oeSwitch.setAttribute("y", CONSTS.OE_SWITCH_UP_Y);
      }
    }

    // update SER LED:
    const serLED = document.getElementById(CONSTS.SER_LED_ID) as HTMLElement;
    if (serLED) {
      if (s.SERState) {
        serLED.setAttribute("style", CONSTS.LED_ON_STYLE);
      } else {
        serLED.setAttribute("style", CONSTS.LED_OFF_STYLE);
      }
    }

    // update SER switch graphic:
    const serSwitch =document.getElementById(CONSTS.SER_SWITCH_GRAPHIC) as HTMLElement;
    if (serSwitch) {
      if (s.SERState) {
        serSwitch.setAttribute("y", CONSTS.SER_SWITCH_DOWN_Y);
      } else {
        serSwitch.setAttribute("y", CONSTS.SER_SWITCH_UP_Y);
      }
    }

    // update D switch graphics:
    const D1Switch = document.getElementById(CONSTS.D1_SWITCH_GRAPHIC) as HTMLElement;
    if (D1Switch) {
      if (s.dSwitchState[0]) {
        D1Switch.setAttribute("y", CONSTS.D_SWITCH_UP_Y);
      } else {
        D1Switch.setAttribute("y", CONSTS.D_SWITCH_DOWN_Y);
      }
    }
    
    const D2Switch = document.getElementById(CONSTS.D2_SWITCH_GRAPHIC) as HTMLElement;
    if (D2Switch) {
      if (s.dSwitchState[1]) {
        D2Switch.setAttribute("y", CONSTS.D_SWITCH_UP_Y);
      } else {
        D2Switch.setAttribute("y", CONSTS.D_SWITCH_DOWN_Y);
      }
    }
    
    const D3Switch = document.getElementById(CONSTS.D3_SWITCH_GRAPHIC) as HTMLElement;
    if (D3Switch) {
      if (s.dSwitchState[2]) {
        D3Switch.setAttribute("y", CONSTS.D_SWITCH_UP_Y);
      } else {
        D3Switch.setAttribute("y", CONSTS.D_SWITCH_DOWN_Y);
      }
    }
    
    const D4Switch = document.getElementById(CONSTS.D4_SWITCH_GRAPHIC) as HTMLElement;
    if (D4Switch) {
      if (s.dSwitchState[3]) {
        D4Switch.setAttribute("y", CONSTS.D_SWITCH_UP_Y);
      } else {
        D4Switch.setAttribute("y", CONSTS.D_SWITCH_DOWN_Y);
      }
    }

    
    if (s.OEState) {
      // update LEDs:
      for (let i = 0; i < CONSTS.LED_ID_ARRAY.length; i++) {
        const currentLED = document.getElementById(CONSTS.LED_ID_ARRAY[i]) as HTMLElement;
        if (currentLED) {
          if (s.outputRegister[i]) {
            currentLED.setAttribute("style", CONSTS.LED_ON_STYLE);
          } else {
            currentLED.setAttribute("style", CONSTS.LED_OFF_STYLE);
          }
        }
      }
  
      // update digits:
      for (let d = 0; d < 4; d++) {
        for (let i = 0; i < 8; i++) {
          const currentSegment = document.getElementById(CONSTS.segments[d][i]) as HTMLElement;
          if (currentSegment) {
            if (s.outputRegister[i] && s.dSwitchState[d]) {
              currentSegment.setAttribute("style", CONSTS.LED_ON_STYLE);
            } else {
              currentSegment.setAttribute("style", CONSTS.LED_OFF_STYLE);
            }
          }
        }
      }


    } else {
      // update LEDs:
      for (let i = 0; i < CONSTS.LED_ID_ARRAY.length; i++) {
        const currentLED = document.getElementById(CONSTS.LED_ID_ARRAY[i]) as HTMLElement;
        if (currentLED) {
          currentLED.setAttribute("style", CONSTS.LED_OFF_STYLE);
        }
      }
  
      // update digits:
      for (let d = 0; d < 4; d++) {
        for (let i = 0; i < 8; i++) {
          const currentSegment = document.getElementById(CONSTS.segments[d][i]) as HTMLElement;
          if (currentSegment) {
            currentSegment.setAttribute("style", CONSTS.LED_OFF_STYLE);
          }
        }
      }

    }
  }

  class Hover { constructor(public readonly type: String) { } };
  class ButtonPush { constructor(public readonly type: String) { } };
  type SREvent = Hover | ButtonPush;


  const observeMouseClick = <T>(elemId: string, result: () => T) =>
    fromEvent<MouseEvent>(document.getElementById(elemId) as HTMLElement, 'mousedown').pipe(
      map(result)
    )
  
    const observeMouseOver = <T>(elemId: string, result: () => T) =>
    fromEvent<MouseEvent>(document, 'mouseover').pipe(
      filter((e) => {
        const svgElem = e.target as SVGElement;
        return svgElem.parentElement == document.getElementById(elemId);
      }),
      map(result)
    )
  
    const oeToggle$ = observeMouseClick(CONSTS.OE_ID, () => new ButtonPush(CONSTS.OE_TOGGLE_STRING));
    const serToggle$ = observeMouseClick(CONSTS.SER_ID, () => new ButtonPush(CONSTS.SER_TOGGLE_STRING));
    const srclrPush$ = observeMouseClick(CONSTS.SRCLR_BUTTON_ID, () => new ButtonPush(CONSTS.SRCLR_BUTTON_PUSH_STRING));
    const srclkPush$ = observeMouseClick(CONSTS.SRCLK_BUTTON_ID, () => new ButtonPush(CONSTS.SRCLK_BUTTON_PUSH_STRING));
    const rclkPush$ = observeMouseClick(CONSTS.RCLK_BUTTON_ID, () => new ButtonPush(CONSTS.RCLK_BUTTON_PUSH_STRING));
    
    const D1Push$ = observeMouseClick(CONSTS.D1_ID, () => new ButtonPush(CONSTS.D1_TOGGLE_STRING));
    const D2Push$ = observeMouseClick(CONSTS.D2_ID, () => new ButtonPush(CONSTS.D2_TOGGLE_STRING));
    const D3Push$ = observeMouseClick(CONSTS.D3_ID, () => new ButtonPush(CONSTS.D3_TOGGLE_STRING));
    const D4Push$ = observeMouseClick(CONSTS.D4_ID, () => new ButtonPush(CONSTS.D4_TOGGLE_STRING));

    const shiftRegister = merge(srclkPush$, srclrPush$, rclkPush$, oeToggle$, serToggle$, D1Push$, D2Push$, D3Push$, D4Push$).pipe(scan(reduceState, initialState));
    shiftRegister.subscribe(updateDisplay);
    
  const srClkLED = document.getElementById(CONSTS.LED_SRCLK_ID) as HTMLElement;
  const srClkButton = document.getElementById(CONSTS.SRCLK_BUTTON_ID) as HTMLElement;
  if (srClkLED && srClkButton) {
    srClkButton.addEventListener('mousedown', () => {srClkLED.setAttribute('style', CONSTS.LED_ON_STYLE)});
    srClkButton.addEventListener('mouseup', () => {srClkLED.setAttribute('style', CONSTS.LED_OFF_STYLE)});
    srClkButton.addEventListener('mouseleave', () => {srClkLED.setAttribute('style', CONSTS.LED_OFF_STYLE)});
  }
  
  const srClrLED = document.getElementById(CONSTS.LED_SRCLR_ID) as HTMLElement;
  const srClrButton = document.getElementById(CONSTS.SRCLR_BUTTON_ID) as HTMLElement;
  if (srClrLED && srClrButton) {
    srClrButton.addEventListener('mousedown', () => {srClrLED.setAttribute('style', CONSTS.LED_ON_STYLE)});
    srClrButton.addEventListener('mouseup', () => {srClrLED.setAttribute('style', CONSTS.LED_OFF_STYLE)});
    srClrButton.addEventListener('mouseleave', () => {srClrLED.setAttribute('style', CONSTS.LED_OFF_STYLE)});
  }
    
  const rClkLED = document.getElementById(CONSTS.LED_RCLK_ID) as HTMLElement;
  const rClkButton = document.getElementById(CONSTS.RCLK_BUTTON_ID) as HTMLElement;
  if (rClkLED && rClkButton) {
    rClkButton.addEventListener('mousedown', () => {rClkLED.setAttribute('style', CONSTS.LED_ON_STYLE)});
    rClkButton.addEventListener('mouseup', () => {rClkLED.setAttribute('style', CONSTS.LED_OFF_STYLE)});
    rClkButton.addEventListener('mouseleave', () => {rClkLED.setAttribute('style', CONSTS.LED_OFF_STYLE)});
  }


}

// Run main function on window load.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
