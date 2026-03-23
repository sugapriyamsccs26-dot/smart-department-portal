export const TIME_SLOTS = [
  { label: '10:30–11:30', startMin: 10 * 60 + 30, endMin: 11 * 60 + 30 },
  { label: '11:30–12:30', startMin: 11 * 60 + 30, endMin: 12 * 60 + 30 },
  { label: '12:30–1:30',  startMin: 12 * 60 + 30, endMin: 13 * 60 + 30 },
  { label: 'Lunch',       startMin: 13 * 60 + 30, endMin: 14 * 60 + 30 },
  { label: '2:30–3:30',   startMin: 14 * 60 + 30, endMin: 15 * 60 + 30 },
  { label: '3:30–4:30',   startMin: 15 * 60 + 30, endMin: 16 * 60 + 30 },
  { label: '4:30–5:30',   startMin: 16 * 60 + 30, endMin: 17 * 60 + 30 }
];

export const TIMETABLE_DB = {
  "MSC_CS": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "11:30–12:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" },
      { "time": "12:30–1:30", "subject": "AI Lab", "faculty": "Dr. Gopinath Ganapathy", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Prof.(Dr.) M. Balamurugan", "type": "vac" },
      { "time": "4:30–5:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "11:30–12:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "12:30–1:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Python Lab", "faculty": "Dr. K. Muthuramalingam", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "4:30–5:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "2:30–3:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "3:30–4:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "11:30–12:30", "subject": "DBMS Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "12:30–1:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" },
      { "time": "2:30–3:30", "subject": "Computer Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Computer Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "2:30–3:30", "subject": "Operating Systems", "faculty": "Dr. P. Sumathy" },
      { "time": "3:30–4:30", "subject": "OS Lab", "faculty": "Dr. M. Lalli", "type": "lab" },
      { "time": "4:30–5:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Value Added Course", "faculty": "Dr. Gopinath Ganapathy", "type": "vac" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Algorithms Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Data Structures", "faculty": "Dr. P. Sumathy" },
      { "time": "3:30–4:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "Computer Networks", "faculty": "Dr. K. Muthuramalingam" }
    ]
  },
  "MSC_DS": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Data Science Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "11:30–12:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Python Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "4:30–5:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. Gopinath Ganapathy", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "2:30–3:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "3:30–4:30", "subject": "Machine Learning for DS", "faculty": "Dr. M. Lalli" },
      { "time": "4:30–5:30", "subject": "Big Data Lab", "faculty": "Dr. M. Durairaj", "type": "lab" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Analytics Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "vac" },
      { "time": "4:30–5:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" },
      { "time": "4:30–5:30", "subject": "Stats Lab", "faculty": "Dr. K. Muthuramalingam", "type": "lab" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" },
      { "time": "11:30–12:30", "subject": "Python Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "12:30–1:30", "subject": "Data Visualization", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Statistical Methods", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Data Science Fundamentals", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "Big Data Analytics", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ]
  },
  "MSC_AI": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "2:30–3:30", "subject": "AI Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "3:30–4:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "2:30–3:30", "subject": "Value Added Course", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "vac" },
      { "time": "3:30–4:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "4:30–5:30", "subject": "ML Lab", "faculty": "Dr. M. Lalli", "type": "lab" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "NLP Lab", "faculty": "Prof.(Dr.) M. Balamurugan", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "11:30–12:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "12:30–1:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Python Programming", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "3:30–4:30", "subject": "Vision Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "4:30–5:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. K. Muthuramalingam", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Python Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Computer Vision", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" },
      { "time": "2:30–3:30", "subject": "NLP", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "3:30–4:30", "subject": "Advanced AI Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "4:30–5:30", "subject": "Computer Vision", "faculty": "Dr. K. Muthuramalingam" }
    ]
  },
  "MCA": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Java Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "3:30–4:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "4:30–5:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "12:30–1:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "2:30–3:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "3:30–4:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "4:30–5:30", "subject": "DBMS Lab", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "lab" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "11:30–12:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "12:30–1:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "2:30–3:30", "subject": "Value Added Course", "faculty": "Dr. M. Lalli", "type": "vac" },
      { "time": "3:30–4:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "DS Lab", "faculty": "Dr. P. Sumathy", "type": "lab" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "12:30–1:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "2:30–3:30", "subject": "SE Lab", "faculty": "Dr. B. Smitha Evelin Zoraida", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "DBMS", "faculty": "Dr. E. George Dharma Prakash Raj" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "11:30–12:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Java Programming", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Value Added Course", "faculty": "Dr. M. Durairaj", "type": "vac" },
      { "time": "4:30–5:30", "subject": "AI Lab", "faculty": "Dr. P. Sumathy", "type": "lab" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Data Structures", "faculty": "Dr. M. Durairaj" },
      { "time": "12:30–1:30", "subject": "Software Engineering", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Java Lab", "faculty": "Dr. K. Muthuramalingam", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Artificial Intelligence", "faculty": "Dr. Gopinath Ganapathy" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "vac" }
    ]
  },
  "MTECH": {
    "monday": [
      { "time": "10:30–11:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "11:30–12:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "12:30–1:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Cloud Lab", "faculty": "Dr. P. Sumathy", "type": "lab" },
      { "time": "3:30–4:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "4:30–5:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" }
    ],
    "tuesday": [
      { "time": "10:30–11:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "11:30–12:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "12:30–1:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "2:30–3:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "4:30–5:30", "subject": "ML Lab", "faculty": "Dr. Gopinath Ganapathy", "type": "lab" }
    ],
    "wednesday": [
      { "time": "10:30–11:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "12:30–1:30", "subject": "Networks Lab", "faculty": "Dr. M. Durairaj", "type": "lab" },
      { "time": "2:30–3:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "3:30–4:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "4:30–5:30", "subject": "Value Added Course", "faculty": "Dr. P. Sumathy", "type": "vac" }
    ],
    "thursday": [
      { "time": "10:30–11:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "11:30–12:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "12:30–1:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "2:30–3:30", "subject": "Value Added Course", "faculty": "Dr. Gopinath Ganapathy", "type": "vac" },
      { "time": "3:30–4:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "4:30–5:30", "subject": "OOD Lab", "faculty": "Dr. E. George Dharma Prakash Raj", "type": "lab" }
    ],
    "friday": [
      { "time": "10:30–11:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "11:30–12:30", "subject": "Machine Learning", "faculty": "Dr. M. Lalli" },
      { "time": "12:30–1:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "2:30–3:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "3:30–4:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "4:30–5:30", "subject": "Advanced DBMS Lab", "faculty": "Dr. M. Durairaj", "type": "lab" }
    ],
    "saturday": [
      { "time": "10:30–11:30", "subject": "Advanced Networks", "faculty": "Dr. K. Muthuramalingam" },
      { "time": "11:30–12:30", "subject": "Value Added Course", "faculty": "Dr. M. Lalli", "type": "vac" },
      { "time": "12:30–1:30", "subject": "Cloud Computing", "faculty": "Dr. E. George Dharma Prakash Raj" },
      { "time": "2:30–3:30", "subject": "Object Oriented Design", "faculty": "Prof.(Dr.) M. Balamurugan" },
      { "time": "3:30–4:30", "subject": "Advanced DBMS", "faculty": "Dr. B. Smitha Evelin Zoraida" },
      { "time": "4:30–5:30", "subject": "Research Methodology", "faculty": "Dr. Gopinath Ganapathy" }
    ]
  }
};

export function getCurrentDay() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function getCurrentSlotIndex() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return TIME_SLOTS.findIndex(slot => minutes >= slot.startMin && minutes < slot.endMin);
}

export function getNextMorningSlot() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes < (10 * 60 + 30) ? 0 : 99;
}

export function findClassInSlot(timetableDB, day, timeLabel, staffName) {
  if (Array.isArray(timetableDB)) {
    // day is capitalized in DB, ensure we match
    const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
    const activeClass = timetableDB.find(entry => {
      const entryTime = `${entry.start_time}–${entry.end_time}`;
      // In some versions start_time might have leading 0 if strictly HH:MM:SS, but we expect HH:MM
      return entry.day === capitalizedDay && entryTime === timeLabel && entry.staff_name === staffName;
    });
    if (activeClass) {
      return {
        courseName: activeClass.program,
        subject: activeClass.course_name,
        time: `${activeClass.start_time}–${activeClass.end_time}`
      };
    }
    return null;
  }

  // Legacy fallback for static DB
  for (const courseKey in timetableDB) {
    const dailySchedule = timetableDB[courseKey][day.toLowerCase()];
    if (dailySchedule) {
      const activeClass = dailySchedule.find(
        entry => entry.time === timeLabel && entry.faculty === staffName
      );
      if (activeClass) {
        return {
          courseName: courseKey.replace('_', ' '),
          subject: activeClass.subject,
          time: activeClass.time
        };
      }
    }
  }
  return null;
}

export function getStaffNotification(timetableDB, loggedInStaff) {
  const currentDay = getCurrentDay();
  
  if (currentDay === 'sunday') {
    return { nowMsg: "Weekend", nextMsg: "No upcoming classes" };
  }

  const slotIndex = getCurrentSlotIndex();
  let nowMsg = "No class scheduled now";
  let nextMsg = "No further classes today";

  if (slotIndex !== -1) {
    if (TIME_SLOTS[slotIndex].label === 'Lunch') {
      nowMsg = "Lunch Break";
    } else {
      const currentClass = findClassInSlot(timetableDB, currentDay, TIME_SLOTS[slotIndex].label, loggedInStaff);
      if (currentClass) {
        nowMsg = `Now: ${currentClass.courseName} → ${currentClass.subject} (${currentClass.time})`;
      }
    }
  }

  let nextSlotIndex = slotIndex === -1 ? getNextMorningSlot() : slotIndex + 1;
  const now = new Date();
  if (slotIndex === -1 && now.getHours() >= 17) {
    nextSlotIndex = 99; // evening
  }

  for (let i = nextSlotIndex; i < TIME_SLOTS.length; i++) {
    if (TIME_SLOTS[i].label === 'Lunch') continue;
    
    const nextClass = findClassInSlot(timetableDB, currentDay, TIME_SLOTS[i].label, loggedInStaff);
    if (nextClass) {
      nextMsg = `Next: ${nextClass.courseName} → ${nextClass.subject} (${nextClass.time})`;
      break;
    }
  }

  return { nowMsg, nextMsg };
}
