// The student's fighter in the boss battle.
//
// Inline SVG rather than an emoji, for one reason: emoji have no limbs. A 🧍
// sliding toward a dragon reads as "sliding", while a figure that plants a
// foot and drives a sword forward reads as "attacking" — and the whole point
// of the animation is that the student can tell at a glance whether they hit
// or got hit. Inline also means no sprite sheet in the bundle and no extra
// request, and `currentColor` lets it inherit the arena's palette either way.
//
// Drawn in PROFILE, facing right, because the arena stands the two fighters
// opposite each other: a front-facing figure in a side-on duel reads as a
// bystander. So the stance is staggered (one leg forward, one back), the
// sword arm is the near one, and the head carries a small nose so the
// direction survives at 64px.
//
// The poses are static geometry chosen per state; the *motion* between them
// is CSS (`.anim-lunge` / `.anim-recoil` in globals.css). Keeping pose and
// motion apart is what lets the reduced-motion path still show a distinct
// attack pose without anything sliding across the screen.
//
// Square caps and mitred joins rather than round: the hard corners are what
// make the figure read as pixel art next to the stepped animation timing,
// instead of as a smooth vector drawing that happens to jump.

/**
 * `victory` and `down` are the resting states the arena holds after the
 * battle ends — the fight's outcome stays on screen instead of the fighters
 * vanishing the moment the result card appears.
 */
export type StickmanPose = "idle" | "attack" | "hurt" | "victory" | "down";

/** Sword geometry per pose: hilt (where the hand is) → tip, plus guard angle. */
const SWORD = {
  idle: { hilt: [37, 31], tip: [50, 13] },
  attack: { hilt: [46, 27], tip: [63, 24] },
  hurt: { hilt: [13, 19], tip: [3, 4] },
  victory: { hilt: [34, 20], tip: [40, 0] },
  /** Dropped, lying on the ground beside them. */
  down: { hilt: [34, 72], tip: [54, 74] },
} as const;

export function Stickman({
  pose = "idle",
  /** 0 = untouched, 1 = one heart from out. Drives the battered look. */
  damage = 0,
  className = "",
}: {
  pose?: StickmanPose;
  damage?: number;
  className?: string;
}) {
  // Damage shows as a slump rather than blood or tearing: this is a lesson,
  // and the tone the course keeps everywhere is "errors are information, not
  // punishment". The figure gets visibly weary, never mangled.
  const slump = damage * 4;
  const headTilt = damage * 8;

  // Colour drifts from emerald toward amber as the hearts go, so the state is
  // legible even to someone who can't read the pose change clearly.
  const stroke = damage > 0.75 ? "#f59e0b" : damage > 0.4 ? "#84cc16" : "#34d399";

  const sword = SWORD[pose];
  // Guard sits across the blade at the hilt — drawn perpendicular to it, so it
  // stays a crossguard whichever way the sword is pointing.
  const [hx, hy] = sword.hilt;
  const [tx, ty] = sword.tip;
  const len = Math.hypot(tx - hx, ty - hy) || 1;
  const px = (-(ty - hy) / len) * 5;
  const py = ((tx - hx) / len) * 5;

  return (
    <svg
      viewBox="0 0 64 80"
      className={className}
      role="img"
      aria-label={
        pose === "attack"
          ? "Your fighter strikes"
          : pose === "hurt"
            ? "Your fighter is struck"
            : pose === "victory"
              ? "Your fighter stands victorious, sword raised"
              : pose === "down"
                ? "Your fighter is down"
                : "Your fighter, sword ready"
      }
      fill="none"
      stroke={stroke}
      strokeWidth={3.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {/* Flat on their back, sword fallen beside them. Drawn as its own
          geometry rather than the standing figure rotated: a rotated stand
          keeps its braced legs and reads as a man tipped over, while a real
          lying pose splays the limbs and reads as down. */}
      {pose === "down" ? (
        <g opacity={0.85}>
          <circle cx={14} cy={58} r={8} />
          <path d="M11 63 L8 66" strokeWidth={2.5} />
          <path d="M22 58 L44 58" />
          <path d="M28 58 L26 47" strokeWidth={3} />
          <path d="M28 58 L30 69" strokeWidth={3} />
          <path d="M44 58 L57 51" />
          <path d="M44 58 L57 66" />
          <g stroke="#94a3b8" strokeLinecap="square">
            <path d={`M${hx} ${hy} L${tx} ${ty}`} strokeWidth={3} />
          </g>
        </g>
      ) : (
      <g transform={`translate(0 ${slump})`}>
        {/* Head in profile: circle plus a nose, so "facing right" survives at
            thumbnail size. */}
        <g transform={`rotate(${headTilt} 26 14)`}>
          <circle cx={26} cy={14} r={8} />
          <path d={pose === "hurt" ? "M18 14 L15 16" : "M34 14 L37 16"} strokeWidth={2.5} />
        </g>

        {/* Spine — leans into an attack, arches back when struck */}
        <path
          d={
            pose === "attack"
              ? "M26 22 L30 46"
              : pose === "hurt"
                ? "M26 22 L22 46"
                : pose === "victory"
                  ? "M26 21 L27 46"
                  : "M26 22 L26 46"
          }
        />

        {/* Rear arm — the balance arm, trailing behind the swing */}
        <path
          d={
            pose === "attack"
              ? "M28 29 L16 35"
              : pose === "hurt"
                ? "M24 29 L34 21"
                : pose === "victory"
                  ? "M26 29 L15 24"
                  : "M26 29 L17 36"
          }
          strokeWidth={3}
        />

        {/* Sword arm — shoulder to hilt, so the blade continues the line */}
        <path
          d={
            pose === "attack"
              ? `M28 29 L${hx} ${hy}`
              : pose === "hurt"
                ? `M24 29 L${hx} ${hy}`
                : `M26 29 L${hx} ${hy}`
          }
          strokeWidth={3}
        />

        {/* Legs — staggered stance in profile: braced in a lunge, scrambling
            backward when hit */}
        {pose === "attack" ? (
          <>
            <path d="M30 46 L45 63" />
            <path d="M30 46 L15 61" />
          </>
        ) : pose === "hurt" ? (
          <>
            <path d="M22 46 L10 63" />
            <path d="M22 46 L32 59" />
          </>
        ) : pose === "victory" ? (
          <>
            <path d="M27 46 L38 66" />
            <path d="M27 46 L16 66" />
          </>
        ) : (
          <>
            <path d="M26 46 L35 66" />
            <path d="M26 46 L18 65" />
          </>
        )}

        {/* The sword: steel, so it reads as an object rather than a limb. */}
        <g stroke="#cbd5e1" strokeLinecap="square">
          <path d={`M${hx} ${hy} L${tx} ${ty}`} strokeWidth={3} />
          <path
            d={`M${hx + px} ${hy + py} L${hx - px} ${hy - py}`}
            strokeWidth={2.5}
            stroke="#94a3b8"
          />
        </g>
      </g>
      )}
    </svg>
  );
}
