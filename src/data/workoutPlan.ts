import type { WorkoutPlan, Exercise, MuscleGroup } from '@/types/workout';

let _id = 0;
const uid = () => `ex_${++_id}`;

function ex(
  name: string,
  muscleGroups: MuscleGroup[],
  sets: number,
  repMin: number,
  repMax: number,
  rest: number,
  cue: string,
  opts?: Partial<Exercise>
): Exercise {
  return {
    id: uid(),
    name,
    muscleGroups,
    type: opts?.type ?? 'bilateral',
    sets,
    repRangeMin: repMin,
    repRangeMax: repMax,
    restSeconds: rest,
    formCue: cue,
    ...opts,
  };
}

// ---------- DAY 1: Legs — Quad Focus + Abs ----------
const day1Exercises: Exercise[] = [
  ex('Back Squat', ['quads', 'glutes'], 4, 6, 8, 180, 'Brace core, break at hips and knees simultaneously. Drive through mid-foot. Aim for parallel or slightly below.'),
  ex('Hack Squat', ['quads'], 3, 8, 10, 120, 'Shoulder pads firm, feet shoulder-width low on platform. Controlled descent, explosive drive up.'),
  ex('Leg Press', ['quads', 'glutes'], 3, 10, 12, 120, 'Feet shoulder-width, mid-platform. Lower until 90° knee bend. Do not lock out knees at top.'),
  ex('Walking Lunges', ['quads', 'glutes'], 3, 10, 12, 90, 'Long stride, torso upright. Front knee tracks over toes. Push through front heel.', { type: 'unilateral' }),
  ex('Leg Extension', ['quads'], 3, 12, 15, 60, 'Squeeze hard at the top for 1 second. Control the negative. Adjust pad to sit just above ankles.'),
  ex('Standing Calf Raise', ['calves'], 4, 12, 15, 60, 'Full stretch at bottom, 2-second hold at top. Slow negatives.'),
  ex('Seated Calf Raise', ['calves'], 3, 15, 20, 60, 'Deep stretch at bottom. Focus on soleus engagement.'),
  ex('Cable Crunch', ['abs'], 3, 15, 20, 60, 'Hinge at the waist, not hips. Exhale and squeeze abs at bottom.'),
  ex('Hanging Leg Raise', ['abs'], 3, 12, 15, 60, 'Minimize swinging. Curl pelvis up at top. Control the descent.'),
];

// ---------- DAY 2: Push — Chest/Shoulders/Triceps + Abs ----------
const day2Exercises: Exercise[] = [
  ex('Flat Barbell Bench Press', ['chest', 'triceps', 'front_delts'], 4, 6, 8, 180, 'Arch back slightly, retract scapulae. Touch mid-chest, drive up and slightly back.'),
  ex('Incline Dumbbell Press', ['chest', 'front_delts'], 3, 8, 10, 120, '30-45° incline. Press up and slightly inward. Full stretch at bottom.'),
  ex('Cable Crossover (Low-to-High)', ['chest'], 3, 12, 15, 60, 'Slight forward lean. Bring hands together at chin height. Squeeze chest.'),
  ex('Overhead Press (Barbell)', ['front_delts', 'triceps'], 4, 6, 8, 150, 'Brace core, press straight overhead. Slight lean back is okay. Lock out at top.'),
  ex('Lateral Raise (Dumbbell)', ['side_delts'], 4, 12, 15, 60, 'Slight bend in elbows. Lead with elbows, not hands. Control the negative.'),
  ex('Tricep Pushdown (Rope)', ['triceps'], 3, 12, 15, 60, 'Elbows pinned to sides. Spread rope at bottom and squeeze.'),
  ex('Overhead Tricep Extension (Cable)', ['triceps'], 3, 10, 12, 60, 'Face away from cable. Elbows close to head. Full stretch behind, lockout in front.'),
  ex('Plank', ['abs'], 3, 45, 60, 60, 'Straight line from head to heels. Brace core, squeeze glutes. Breathe steadily.', { type: 'timed' }),
  ex('Side Plank', ['obliques'], 3, 30, 45, 60, 'Stack feet or stagger. Hips up, body in a straight line. Do not let hips sag.', { type: 'timed' }),
];

// ---------- DAY 3: Pull — Back/Biceps + Abs ----------
const day3Exercises: Exercise[] = [
  ex('Barbell Row (Overhand)', ['lats', 'upper_back', 'biceps'], 4, 6, 8, 150, 'Hinge at hips, ~45° torso. Pull to lower chest/upper abs. Squeeze shoulder blades.'),
  ex('Pull-Up (Weighted if possible)', ['lats', 'biceps'], 4, 6, 10, 120, 'Full dead hang at bottom. Drive elbows down and back. Chin over bar.', { type: 'bodyweight' }),
  ex('Seated Cable Row (Close Grip)', ['lats', 'upper_back'], 3, 10, 12, 90, 'Sit tall, chest up. Pull handle to lower chest. Squeeze at contraction.'),
  ex('Single-Arm Dumbbell Row', ['lats', 'upper_back'], 3, 10, 12, 90, 'Support on bench. Pull dumbbell to hip. Full stretch at bottom.', { type: 'unilateral' }),
  ex('Face Pull', ['rear_delts', 'upper_back'], 3, 15, 20, 60, 'High cable. Pull to face level, externally rotating at top. Hold 1 second.'),
  ex('Barbell Curl', ['biceps'], 3, 8, 10, 90, 'Keep elbows pinned at sides. Full range of motion. No swinging.'),
  ex('Incline Dumbbell Curl', ['biceps'], 3, 10, 12, 60, '45° incline. Let arms hang back for full stretch. Curl to shoulder.'),
  ex('Hammer Curl', ['biceps', 'forearms'], 3, 10, 12, 60, 'Neutral grip. Alternating or together. Squeeze at top.'),
  ex('Ab Wheel Rollout', ['abs'], 3, 10, 15, 60, 'Knees on pad. Roll out until arms extended. Brace core to pull back.'),
  ex('Bicycle Crunch', ['abs', 'obliques'], 3, 15, 20, 60, 'Opposite elbow to knee. Slow and controlled. Full extension of each leg.'),
];

// ---------- DAY 4: Legs — Posterior Chain + Arm Finisher ----------
const day4Exercises: Exercise[] = [
  ex('Romanian Deadlift (RDL)', ['hamstrings', 'glutes', 'lower_back'], 4, 8, 10, 150, 'Soft knees, hinge at hips. Bar close to legs. Feel deep hamstring stretch. Squeeze glutes at top.'),
  ex('Bulgarian Split Squat', ['quads', 'glutes'], 3, 8, 10, 120, 'Rear foot on bench. Torso slightly forward. Lower until front thigh is parallel.', { type: 'unilateral' }),
  ex('Leg Curl (Lying or Seated)', ['hamstrings'], 3, 10, 12, 90, 'Full range of motion. Squeeze hard at contraction. Control the negative.'),
  ex('Hip Thrust (Barbell)', ['glutes'], 4, 8, 12, 120, 'Shoulders on bench, feet flat. Drive through heels. Squeeze glutes at top. Chin tucked.'),
  ex('Good Morning', ['hamstrings', 'lower_back', 'glutes'], 3, 10, 12, 90, 'Bar on upper back. Hinge at hips, soft knees. Feel hamstring stretch. Brace core.'),
  ex('Standing Calf Raise', ['calves'], 4, 12, 15, 60, 'Full stretch at bottom, 2-second hold at top. Slow negatives.'),
  ex('Reverse Curl (EZ Bar)', ['forearms', 'biceps'], 3, 12, 15, 60, 'Overhand grip on EZ bar. Controlled curl. Squeeze forearms at top.'),
  ex('Tricep Dip (Weighted)', ['triceps', 'chest'], 3, 8, 10, 120, 'Lean slightly forward for chest. Elbows back for tricep focus. Full lockout.', { type: 'bodyweight' }),
  ex('Wrist Curl', ['forearms'], 3, 15, 20, 60, 'Forearms on thighs, wrists off edge. Curl up and squeeze.'),
  ex('Plank', ['abs'], 3, 45, 60, 60, 'Straight line from head to heels. Brace core, squeeze glutes.', { type: 'timed' }),
];

// ---------- DAY 5: Shoulders + Dedicated Arms + Abs ----------
const ss1a = 'ss5_1a';
const ss1b = 'ss5_1b';
const ss2a = 'ss5_2a';
const ss2b = 'ss5_2b';

const day5Exercises: Exercise[] = [
  ex('Overhead Press (Dumbbell)', ['front_delts', 'triceps'], 4, 8, 10, 120, 'Seated or standing. Press overhead, slight arc. Full lockout.'),
  ex('Arnold Press', ['front_delts', 'side_delts'], 3, 10, 12, 90, 'Start palms facing you. Rotate as you press. Smooth arc motion.'),
  ex('Lateral Raise (Cable)', ['side_delts'], 4, 12, 15, 60, 'Single arm, across body. Slight lean away. Control up and down.', { type: 'unilateral' }),
  ex('Reverse Pec Deck', ['rear_delts'], 3, 12, 15, 60, 'Chest against pad. Lead with elbows. Squeeze shoulder blades together.'),
  ex('Barbell Curl', ['biceps'], 3, 8, 10, 90, 'Elbows pinned. Controlled curl. Full ROM.', { supersetPairId: ss1b, id: ss1a } as any),
  ex('Skull Crusher (EZ Bar)', ['triceps'], 3, 8, 10, 90, 'Lower to forehead. Elbows stay pointing up. Press to lockout.', { supersetPairId: ss1a, id: ss1b } as any),
  ex('Hammer Curl', ['biceps', 'forearms'], 3, 10, 12, 60, 'Neutral grip. Squeeze at top.', { supersetPairId: ss2b, id: ss2a } as any),
  ex('Tricep Kickback', ['triceps'], 3, 10, 12, 60, 'Hinge forward. Extend arm fully behind. Squeeze tricep.', { supersetPairId: ss2a, id: ss2b } as any),
  ex('Concentration Curl', ['biceps'], 3, 12, 15, 60, 'Elbow braced on inner thigh. Slow curl, peak contraction.', { type: 'unilateral' }),
  ex('Overhead Cable Tricep Extension', ['triceps'], 3, 12, 15, 60, 'Face away. Elbows by ears. Full stretch and lockout.'),
  ex('Cable Crunch', ['abs'], 3, 15, 20, 60, 'Hinge at waist. Exhale and squeeze.'),
  ex('Hanging Knee Raise', ['abs'], 3, 12, 15, 60, 'Minimize swing. Curl knees to chest. Slow negatives.'),
  ex('Russian Twist', ['obliques'], 3, 15, 20, 60, 'Lean back slightly, feet off ground. Rotate torso side to side.'),
];

// Fix IDs for supersets in day 5
day5Exercises[4].id = ss1a;
day5Exercises[4].supersetPairId = ss1b;
day5Exercises[5].id = ss1b;
day5Exercises[5].supersetPairId = ss1a;
day5Exercises[6].id = ss2a;
day5Exercises[6].supersetPairId = ss2b;
day5Exercises[7].id = ss2b;
day5Exercises[7].supersetPairId = ss2a;

// ---------- DAY 6: Legs — High Volume + Back Thickness ----------
const day6Exercises: Exercise[] = [
  ex('Front Squat', ['quads', 'abs'], 4, 6, 8, 180, 'Clean grip or cross-arm. Elbows high, torso upright. Controlled depth.'),
  ex('Leg Press (Narrow Stance)', ['quads'], 3, 12, 15, 120, 'Feet close together, lower on platform. Deep bend, push through heels.'),
  ex('Sissy Squat or Smith Machine Squat', ['quads'], 3, 12, 15, 90, 'Lean back, knees forward. Deep quad stretch. Controlled movement.'),
  ex('Leg Extension', ['quads'], 3, 15, 20, 60, 'High rep burnout. Squeeze at top. Control negative.'),
  ex('T-Bar Row', ['lats', 'upper_back'], 4, 8, 10, 120, 'Close or wide grip. Pull to chest. Squeeze mid-back.'),
  ex('Chest-Supported Row', ['upper_back', 'rear_delts'], 3, 10, 12, 90, 'Chest on pad. Wide or neutral grip. Retract scapulae.'),
  ex('Seated Calf Raise', ['calves'], 4, 15, 20, 60, 'Deep stretch. Hold at top.'),
  ex('Dead Bug', ['abs'], 3, 12, 15, 60, 'Lower back pressed to floor. Opposite arm and leg extend. Breathe out as you extend.'),
];

// ---------- DAY 7: Full Arms + Abs ----------
const ss3a = 'ss7_1a';
const ss3b = 'ss7_1b';
const ss4a = 'ss7_2a';
const ss4b = 'ss7_2b';
const ss5a = 'ss7_3a';
const ss5b = 'ss7_3b';

const day7Exercises: Exercise[] = [
  ex('EZ Bar Curl', ['biceps'], 4, 8, 10, 90, 'Wide grip on EZ bar. Full ROM. No swinging.', { id: ss3a, supersetPairId: ss3b }),
  ex('Close Grip Bench Press', ['triceps', 'chest'], 4, 8, 10, 90, 'Hands shoulder width. Elbows tucked. Touch lower chest.', { id: ss3b, supersetPairId: ss3a }),
  ex('Preacher Curl', ['biceps'], 3, 10, 12, 60, 'Chest against pad. Controlled negative. Squeeze at top.', { id: ss4a, supersetPairId: ss4b }),
  ex('Overhead Tricep Extension (Dumbbell)', ['triceps'], 3, 10, 12, 60, 'Both hands on one dumbbell. Lower behind head. Full stretch.', { id: ss4b, supersetPairId: ss4a }),
  ex('Spider Curl', ['biceps'], 3, 12, 15, 60, 'Chest on incline bench, arms hanging. Curl up, peak squeeze.', { id: ss5a, supersetPairId: ss5b }),
  ex('Rope Pushdown', ['triceps'], 3, 12, 15, 60, 'Elbows pinned. Spread rope at bottom. Squeeze.', { id: ss5b, supersetPairId: ss5a }),
  ex('Cross-Body Hammer Curl', ['biceps', 'forearms'], 3, 12, 15, 60, 'Curl across body toward opposite shoulder. Alternating.', { type: 'unilateral' }),
  ex('Diamond Push-Up', ['triceps', 'chest'], 3, 12, 20, 60, 'Hands close together, diamond shape. Elbows back. Full extension.', { type: 'bodyweight' }),
  ex('Reverse Curl', ['forearms', 'biceps'], 3, 15, 20, 60, 'Overhand grip. Slow and controlled. Squeeze forearms.'),
  ex('Cable Crunch', ['abs'], 3, 15, 20, 60, 'Hinge at waist. Full contraction.'),
  ex('Plank (Weighted)', ['abs'], 3, 45, 60, 60, 'Plate on back. Straight line. Brace hard.', { type: 'timed' }),
];

export const defaultWorkoutPlan: WorkoutPlan = {
  id: 'default_hypertrophy_7day',
  name: '7-Day Hypertrophy Split',
  days: [
    { id: 'day_1', dayNumber: 1, name: 'Legs — Quad Focus + Abs', focusMuscles: ['quads', 'calves', 'abs'], exercises: day1Exercises },
    { id: 'day_2', dayNumber: 2, name: 'Push — Chest/Shoulders/Triceps + Abs', focusMuscles: ['chest', 'front_delts', 'side_delts', 'triceps', 'abs'], exercises: day2Exercises },
    { id: 'day_3', dayNumber: 3, name: 'Pull — Back/Biceps + Abs', focusMuscles: ['lats', 'upper_back', 'biceps', 'abs'], exercises: day3Exercises },
    { id: 'day_4', dayNumber: 4, name: 'Legs — Posterior Chain + Arm Finisher', focusMuscles: ['hamstrings', 'glutes', 'calves', 'forearms', 'triceps', 'abs'], exercises: day4Exercises },
    { id: 'day_5', dayNumber: 5, name: 'Shoulders + Arms + Abs', focusMuscles: ['front_delts', 'side_delts', 'rear_delts', 'biceps', 'triceps', 'abs'], exercises: day5Exercises },
    { id: 'day_6', dayNumber: 6, name: 'Legs — High Volume + Back Thickness', focusMuscles: ['quads', 'lats', 'upper_back', 'calves', 'abs'], exercises: day6Exercises },
    { id: 'day_7', dayNumber: 7, name: 'Full Arms + Abs', focusMuscles: ['biceps', 'triceps', 'forearms', 'abs'], exercises: day7Exercises },
  ],
};
