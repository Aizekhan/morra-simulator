import { MORRA_CONFIG }
from "../world/MorraConfig";

export class TimeHUD {

  element: HTMLDivElement;

  constructor() {

    this.element =
      document.createElement(
        "div"
      );

    this.element.style.position =
      "absolute";

    this.element.style.top =
      "10px";

    this.element.style.left =
      "10px";

    this.element.style.width =
      "260px";

    this.element.style.padding =
      "10px";

    this.element.style.background =
      "rgba(0,0,0,0.75)";

    this.element.style.color =
      "#ffffff";

    this.element.style.fontFamily =
      "monospace";

    this.element.style.fontSize =
      "14px";

    this.element.style.border =
      "1px solid #444";

    this.element.style.borderRadius =
      "8px";

    this.element.style.zIndex =
      "1000";

    document.body.appendChild(
      this.element
    );
  }

  update(
    year:number,
    month:number,
    day:number,
    hour:number
  ) {

    this.element.style.display =
      MORRA_CONFIG.DEBUG.showTimePanel
        ? "block"
        : "none";

    const percent =
      (
        hour /
        MORRA_CONFIG.HOURS_IN_DAY
      ) * 100;

    const timelineVisible =
      MORRA_CONFIG.DEBUG.showTimeline
        ? "block"
        : "none";

    this.element.innerHTML =
`
<div
style="
font-size:18px;
margin-bottom:8px;
font-weight:bold;
"
>
MORRA
</div>

<div
style="
display:flex;
justify-content:space-between;
margin-bottom:12px;
"
>

<span>
Y:${year}
</span>

<span>
M:${month}
</span>

<span>
D:${day}
</span>

<span>
H:${Math.floor(hour)}
</span>

</div>

<div
style="
display:${timelineVisible};
"
>

<div
style="
height:8px;
background:#222;
border:1px solid #555;
position:relative;
"
>

<div
style="
position:absolute;
left:${percent}%;
top:-3px;
width:2px;
height:14px;
background:#00ffff;
"
>
</div>

</div>

<div
style="
display:flex;
justify-content:space-between;
margin-top:4px;
font-size:10px;
color:#777;
"
>

<span>
0
</span>

<span>
${Math.floor(
  MORRA_CONFIG.HOURS_IN_DAY / 2
)}
</span>

<span>
${MORRA_CONFIG.HOURS_IN_DAY}
</span>

</div>

</div>
`;
  }
}