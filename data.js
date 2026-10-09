/* Content for the trial page. Course paths come from the grade pathways on icodejr.com. */

window.ICJ = {
  ages: {
    '5-6':   { label: '5–6',   grades: 'KG–1' },
    '7-8':   { label: '7–8',   grades: 'Grades 2–3' },
    '9-10':  { label: '9–10',  grades: 'Grades 4–5' },
    '11-13': { label: '11–13', grades: 'Grades 6–8' },
    '14-18': { label: '14–18', grades: 'Grades 9–12' },
  },

  tracks: {
    combined: 'Combined',
    coding: 'Coding + AI',
    robotics: 'Robotics + AI',
    package: 'Complete package',
  },

  // Learning paths by age, then track, in curriculum order.
  paths: {
    '5-6': {
      package: ['ScratchJr Level 1', 'ScratchJr Level 2', 'AI Explorers', 'RoboPlay', 'Creative Tech Lab', 'Logic Games'],
    },
    '7-8': {
      combined: ['Scratch & AI Fundamentals', 'Fun with Electronics', 'Micro:bit for Beginners', 'Advanced Scratch & Applied AI', 'Micro:bit Games', 'MIT App Inventor + AI', 'Micro:bit Applications', 'AI & Machine Learning', 'Generative AI Creativity', 'Sensors in Robots'],
      coding: ['Minecraft Coding', 'Digital Citizenship', 'Sprite Lab Game Design', 'Scratch & AI Fundamentals', 'Advanced Scratch & Applied AI', 'App Lab Development', 'MIT App Inventor + AI', 'Design Thinking', '3D Design with Tinkercad', 'Roblox Game Development', 'Generative AI Creativity'],
      robotics: ['Fun with Electronics', 'Micro:bit for Beginners', 'Micro:bit Games', 'Micro:bit Applications', 'AI & Machine Learning', 'Sensors in Robots'],
    },
    '9-10': {
      combined: ['Advanced Scratch & AI', 'Micro:bit Beginner', 'MIT App Inventor', 'Micro:bit Applications', 'Python & Data Structures', 'AI & Smart Robots', 'Fun with PictoBlox', 'Generative AI', 'AI & Smart Systems'],
      coding: ['Python with EduBlocks', 'Digital Citizenship', 'Advanced Scratch & AI', 'MIT App Inventor', 'Web Development', 'Python & Data Structures', 'Advanced Python & OOP', '3D Design with Tinkercad', 'Generative AI', 'Game Lab Development'],
      robotics: ['Fun with Electronics', 'Micro:bit Beginner', 'Micro:bit Applications', 'AI & Smart Robots', 'Fun with PictoBlox', 'AI & Smart Systems'],
    },
    '11-13': {
      combined: ['Python Programming Foundations', 'C++ Programming Fundamentals', 'Advanced Python, GUI & Games', 'Basic Circuits', 'Arduino Programming', 'Arduino Intelligent Systems', 'Web Development (HTML & CSS)', 'Advanced Robotics', 'Unity Game Development', 'IoT & AI Applications', 'Moving Robots'],
      coding: ['Python Programming Foundations', 'Advanced Python, GUI & Games', 'Web Development (HTML & CSS)', 'Web Dev Level 2 (JS & React)', 'Design – UI/UX with Canva', 'Unity Game Development'],
      robotics: ['C++ Programming Fundamentals', 'Basic Circuits', 'Arduino Programming', 'Arduino Intelligent Systems', 'Advanced Robotics', 'IoT & AI Applications', 'Moving Robots', 'Humanoid Robotics'],
    },
  },

  // What the child builds in the free class, by preview scene.
  builds: {
    story:  { noun: 'animated story',  line: '{N} animates a robot that walks, jumps and says hello, using ScratchJr blocks.' },
    game:   { noun: 'game',            line: '{N} codes a star-catcher game with a live score, guided step by step.' },
    python: { noun: 'Python game',     line: '{N} writes a number-guessing game in real Python, line by line.' },
    robot:  { noun: 'robot mission',   line: '{N} programs a robot to find its way through an obstacle course.' },
    ai:     { noun: 'AI buddy',        line: '{N} builds a friendly AI chat buddy and teaches it a personality.' },
  },

  // Mentor note shown on the example plan, by interest.
  notes: {
    coding: 'Loved making the game work. Strong at sequencing. Start with {C}.',
    robotics: 'Really enjoyed getting the robot moving. Good at spotting patterns. Start with {C}.',
    ai: 'Asked great questions about how AI thinks. Start with {C}.',
    unsure: 'Curious and quick to try ideas. Start with {C} and explore from there.',
  },
};

/* Press features for the "iCodejr in the news" section.
   video options:
     { type: 'youtube',   id: 'VIDEO_ID' }               plays in the pop-up
     { type: 'vimeo',     id: '123456789' }              plays in the pop-up
     { type: 'mp4',       src: 'assets/press/clip.mp4' } plays in the pop-up
     { type: 'instagram', url: 'https://www.instagram.com/reel/POST_ID/' }
     { type: 'link',      url: 'https://…' }             opens the outlet's own page in a new tab
     null                                                 shows "Video coming soon"
   logo is an image URL; logoText is used instead when there is no logo image.
   thumb is optional; without it the card shows the outlet logo. */
window.ICJ.press = [
  {
    outlet: 'Dubai One',
    logo: 'https://icodejr.com/wp-content/uploads/2026/06/dubaimedia-300x117.webp',
    title: "Building the next generation of coders: iCodejr's approach to STEM education",
    date: 'Oct 2025',
    thumb: 'https://i.ytimg.com/vi/hnHprGV0-6o/maxresdefault.jpg',
    duration: '2:01',
    video: { type: 'youtube', id: 'hnHprGV0-6o' },
  },
  {
    outlet: 'Dubai Eye 103.8',
    logo: 'https://icodejr.com/wp-content/uploads/2026/06/dubaieye-300x117.webp',
    title: 'iCodejr on Dubai Eye radio',
    date: 'Dec 2025',
    thumb: 'https://i.ytimg.com/vi/1y62SPpOy84/maxresdefault.jpg',
    duration: '11:20',
    video: { type: 'youtube', id: '1y62SPpOy84' },
  },
  {
    outlet: 'ET Now',
    logoText: 'ET NOW',
    title: 'Leaders of Tomorrow, Season 10: Eye on Dubai education panel',
    date: 'Apr 2022',
    // ET Now's own YouTube upload. The thumbnail is a frame with Hannan and the iCodejr caption on screen.
    thumb: 'https://i.ytimg.com/vi/yq1VXGUuTYs/hq3.jpg',
    duration: '21:51',
    video: { type: 'youtube', id: 'yq1VXGUuTYs' },
  },
];

/* Student projects (from icodejr.com). category: game | app | art | story */
window.ICJ.projects = [
  { title: 'Playful Starters', student: 'Mohammed', age: 9, tool: 'Scratch', category: 'game', image: 'https://icodejr.com/wp-content/uploads/2026/07/space-adventure-BUF_ibUf.webp', alt: 'A space shooter game with a rocket, stars and green aliens' },
  { title: 'Music Maker App', student: 'Yuki', age: 11, tool: 'Scratch', category: 'app', image: 'https://icodejr.com/wp-content/uploads/2026/07/music-makerapp.webp', alt: 'A colourful music maker app with a piano keyboard' },
  { title: 'Platformer Adventure', student: 'Ahmed', age: 12, tool: 'Scratch', category: 'game', image: 'https://icodejr.com/wp-content/uploads/2026/07/icodejr-projects-password-checker.webp', alt: 'Screenshot of a student platformer project' },
  { title: 'Math Quiz Game', student: 'Omar', age: 10, tool: 'Scratch', category: 'game', image: 'https://icodejr.com/wp-content/uploads/2026/07/math-quiz-game.webp', alt: 'A maths quiz game screen' },
  { title: 'Digital Art Gallery', student: 'Emma', age: 10, tool: 'Scratch', category: 'art', image: 'https://icodejr.com/wp-content/uploads/2026/07/3d-gallery.webp', alt: 'A digital art gallery project' },
  { title: 'Interactive Story Game', student: 'Fatima', age: 9, tool: 'Scratch', category: 'story', image: 'https://icodejr.com/wp-content/uploads/2026/07/Interactive-Story-Game.webp', alt: 'An interactive story game scene' },
];

window.ICJ.projectCategories = { game: 'Game', app: 'App & music', art: 'Art', story: 'Story' };

/* FAQ topics: the coloured pill shown on each question. */
window.ICJ.faqTopics = {
  start: 'Getting started',
  class: 'In the class',
  path: 'Learning path',
  progress: 'Progress',
  safety: 'Screen time & safety',
  cost: 'Flexibility & cost',
};

/* FAQ: general questions for every family, plus questions for each age band.
   Each entry is [question, answer, topic].
   The FAQ section shows the age band picked in the booking card (parents can switch it).
   Answers are based on icodejr.com; review them with the academic team before launch. */
window.ICJ.faq = {
  general: [
    ['Is the free class really free?', "Yes. The trial class is completely free and there's no obligation to enrol. We don't ask for card details.", 'cost'],
    ['What happens after the class?', "You'll get feedback on how your child did, along with a recommended learning plan. Then you decide if and how you'd like to continue.", 'progress'],
    ['What does my child need?', 'A laptop or tablet with a stable internet connection, and headphones if you have them. The mentor shares everything else during the class.', 'class'],
    ['Are classes online or in person?', 'All core classes are taught live by trained instructors. We offer live online classes and, for some programs and locations in the UAE, in-person learning too.', 'class'],
    ["What if my child doesn't enjoy the classes?", "We offer a money-back guarantee. If a program isn't the right fit, we'll work with you to fix it or refund you as per our policy.", 'cost'],
    ['Are there long-term commitments?', "No. You don't commit to anything upfront. Credits never expire and can be paused anytime.", 'cost'],
  ],
  '5-6': [
    ['Can a 5-year-old really learn to code?', 'Yes. At this age coding is about sequencing, cause and effect, and spotting patterns. Children start with ScratchJr, which uses picture blocks, so they can begin before they read confidently.', 'start'],
    ['Is 50 minutes too long for a young child?', 'Classes are hands-on and paced for young children, and the mentor adjusts to how your child is doing. The free class is a good way to see how your child handles a full session.', 'class'],
    ['Should I sit with my child?', "It helps to be nearby in the first class, for example to help with the device. You'll join at the end anyway to hear the mentor's feedback and plan.", 'class'],
    ['What will my child learn first?', 'The KG–1 path starts with ScratchJr Level 1 (sequencing and logic), then ScratchJr Level 2, AI Explorers, RoboPlay, Creative Tech Lab and Logic Games.', 'path'],
  ],
  '7-8': [
    ['Does my child need any coding experience?', 'No. Basic reading helps because Scratch blocks have words on them, but there is no typing: children drag and snap blocks together.', 'start'],
    ['Is this just more screen time?', 'It is active, creative screen time. Your child designs and builds games and stories, explains their thinking to a mentor, and learns to fix problems.', 'safety'],
    ['What will they build?', 'Games, animations and interactive stories in Scratch and Minecraft, plus first electronics projects with micro:bit, such as lights, buttons and sensors.', 'path'],
    ['Coding, robotics, or both?', 'The Combined path is the most popular at this age: Scratch and AI alongside electronics and micro:bit. The mentor recommends a path after the free class.', 'path'],
  ],
  '9-10': [
    ['Is my child ready for a real programming language?', 'Many are. The path moves from Scratch towards Python using EduBlocks, which shows the Python code behind each block, so the jump to typed code feels natural.', 'start'],
    ['Can they build real apps?', 'Yes. With MIT App Inventor, children build working phone apps, and in Game Lab they program their own games.', 'path'],
    ['Will they learn about AI?', 'Yes. Courses like Generative AI and AI & Smart Robots show how AI works and how to use it well, alongside Digital Citizenship for staying safe online.', 'path'],
    ["How will I see my child's progress?", 'Parents get regular updates, project showcases and certificates, plus monthly parent meetings and a parent app.', 'progress'],
  ],
  '11-13': [
    ['Which programming languages will my child learn?', 'Most start with Python Programming Foundations, then move on to C++, web development (HTML, CSS, then JavaScript and React) and Unity game development.', 'path'],
    ['My child already codes. Will they repeat the basics?', 'No. The skill check in the free class places them at the right level, and the plan starts from there.', 'start'],
    ['Can my child do robotics and hardware?', "Yes. The Robotics + AI track covers Basic Circuits, Arduino Programming, Advanced Robotics, IoT & AI and Humanoid Robotics. The mentor will tell you if a course needs any hardware.", 'path'],
    ['Will this help with computer science at school?', 'The courses build the programming and problem-solving skills used in school computing, through real projects rather than worksheets.', 'progress'],
  ],
  '14-18': [
    ['Is 14+ too late to start?', 'Not at all. Older students move quickly into Python, web development, C++, Unity and AI projects, at a pace set by the skill check.', 'start'],
    ['Can this help with university applications?', 'Students build a portfolio of real projects they can show in applications, which is what our college-ready portfolio is about.', 'progress'],
    ['Are there competitions?', 'Yes. iCodejr has run 20+ hackathons, including Code Battle, our coding competition for students across the UAE.', 'progress'],
    ['How do classes fit around exams?', 'Credits never expire and you can pause anytime, so classes can fit around exam seasons.', 'cost'],
  ],
};

// icodejr.com does not list a separate Grades 9–12 pathway; older students use the advanced tracks.
window.ICJ.paths['14-18'] = window.ICJ.paths['11-13'];

// Google rating strip (between the FAQ and the closer). Real reviews from the iCodejr Google Business profile,
// in the parents' own words; "…" marks where a longer review was shortened. Add more the same way;
// the hero booking card rotates through all of them in a random order.
window.ICJ.googleReviews = {
  rating: 4.9,
  url: 'https://maps.google.com/?cid=1559053543571971511', // the iCodejr listing on Google Maps
  reviews: [
    { name: 'Mary B.', text: '… the lessons include engaging projects and clear explanations—my son looked forward to every coding assignment and learned a lot.' },
    { name: 'Biswajyoti', text: 'My son has been learning coding for last 18 months. Incredibly grateful and satisfied with icodejr…' },
    { name: 'Irfan B.', text: 'My son absolutely loved the guys at iCodeJR when we visited the activateme festival. …' },
    { name: 'Suchit P.', text: 'iCodejr is a fantastic platform for young minds to dive into the world of coding and robotics! …' },
    { name: 'Mary A.', text: 'Really professional and great with kids! … my son loved his lessons.' },
    { name: 'Mubeen M.', text: 'iCodeJr is an ideal destination for parents looking for a coding school for their young children. …' },
    { name: 'Abhishek M.', text: 'Great Initiative for Growing Kids to know about the Robotics with fun. …' },
  ],
};

// Student testimonial videos (section after "What happens in the 50 minutes"). The section stays hidden while this is empty.
// Each entry uses the same video formats as ICJ.press, for example:
//   { title: 'I built my own Roblox obby', outlet: 'Aarav, age 10', duration: '1:12',
//     thumb: 'https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg', video: { type: 'youtube', id: 'VIDEO_ID' } }
// video.type can be 'youtube', 'vimeo', 'mp4' (with src) or 'instagram' (with url).
window.ICJ.studentVideos = [
  {
    title: 'Student testimonial: Zyann A.',
    outlet: 'Student · Dubai',
    duration: '0:20',
    thumb: 'https://i.ytimg.com/vi/yEByVSh62oU/oardefault.jpg', // vertical video, so use the portrait frame and crop to his face
    thumbPos: '50% 40%',
    video: { type: 'youtube', id: 'yEByVSh62oU', portrait: true },
  },
  {
    title: "Jigar's Python Smart Study Planner",
    outlet: 'Student project showcase',
    duration: '2:24',
    thumb: 'https://i.ytimg.com/vi/VlOezhrC4Ew/maxresdefault.jpg',
    video: { type: 'youtube', id: 'VlOezhrC4Ew' },
  },
  {
    title: "Vansh's Arduino Reaction Timer",
    outlet: 'Student project showcase',
    duration: '1:04',
    thumb: 'https://i.ytimg.com/vi/VcSRQY6ojdQ/maxresdefault.jpg',
    video: { type: 'youtube', id: 'VcSRQY6ojdQ' },
  },
];
