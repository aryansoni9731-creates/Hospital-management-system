const bcrypt = require("bcryptjs");
const AccessControl = require("../models/AccessControl");
const Doctor = require("../models/Doctor");
const Medicine = require("../models/Medicine");
const { PORTAL_KEY } = require("../middleware/auth");

async function ensurePortalPassword() {
  const configuredPassword = process.env.DOCTOR_PORTAL_PASSWORD;
  if (!configuredPassword) {
    console.warn("⚠️ DOCTOR_PORTAL_PASSWORD is not set. Doctor Portal password has not been initialized.");
    return;
  }

  const existing = await AccessControl.findOne({ key: PORTAL_KEY });
  if (!existing) {
    const passwordHash = await bcrypt.hash(configuredPassword, 12);
    await AccessControl.create({ key: PORTAL_KEY, passwordHash });
    console.log("🔐 Doctor Portal password initialized and stored as a hash in MongoDB.");
  }
}

async function ensureDefaultDoctors() {
  try {
    const count = await Doctor.countDocuments();
    if (count === 0) {
      const defaultDoctors = [
        {
          name: "Dr. Sharma",
          nameHi: "डॉ. शर्मा",
          specialization: "General Physician",
          specializationHi: "सामान्य चिकित्सक",
          roomNumber: "Room 1 (कक्ष 1)",
          slots: ["10:00 AM", "11:00 AM", "12:00 PM"],
          image: "doctor-1.jpeg"
        },
        {
          name: "Dr. Roy",
          nameHi: "डॉ. रॉय",
          specialization: "Child Specialist",
          specializationHi: "बाल रोग विशेषज्ञ",
          roomNumber: "Room 2 (कक्ष 2)",
          slots: ["1:00 PM", "2:00 PM", "3:00 PM"],
          image: "doctor-2.jpg"
        },
        {
          name: "Dr. Tanwar",
          nameHi: "डॉ. तंवर",
          specialization: "Bone Specialist",
          specializationHi: "हड्डी रोग विशेषज्ञ",
          roomNumber: "Room 3 (कक्ष 3)",
          slots: ["4:00 PM", "5:00 PM", "6:00 PM"],
          image: "doctor-3.jpg"
        }
      ];
      await Doctor.insertMany(defaultDoctors);
      console.log("👨‍⚕️ Default rural clinic doctors seeded into MongoDB.");
    }
  } catch (err) {
    console.error("Error seeding default doctors:", err);
  }
}

async function ensureDefaultMedicines() {
  try {
    const count = await Medicine.countDocuments();
    if (count === 0) {
      const defaultMedicines = [
        {
          name: "Paracetamol (500mg / 650mg)",
          category: "Fever",
          purpose: "Fever & Body Pain",
          purposeHi: "बुखार और बदन दर्द",
          timing: "2 to 3 times daily, after food",
          timingHi: "दिन में 2 से 3 बार, खाना खाने के बाद",
          icons: "🌅 🌞 🌙",
          warning: "Do not take more than 4 tablets in 24 hours.",
          warningHi: "24 घंटे में 4 से ज्यादा गोली न लें।",
          voiceTextHi: "पैरासिटामोल बुखार और बदन दर्द के लिए है। इसे खाना खाने के बाद दिन में दो से तीन बार लें।",
          inStock: true
        },
        {
          name: "Cough Syrup (Ascoril / Benadryl)",
          category: "Cold",
          purpose: "Cough & Throat Soreness",
          purposeHi: "खांसी और गले की खराश",
          timing: "10ml 3 times a day with warm water",
          timingHi: "दिन में 3 बार 10ml, गुनगुने पानी के साथ",
          icons: "🌅 🌞 🌙",
          warning: "Avoid drinking chilled water right after taking medicine.",
          warningHi: "दवा लेने के बाद तुरंत ठंडा पानी न पिएं।",
          voiceTextHi: "कफ सिरप खांसी और गले की खराश के लिए है। दिन में तीन बार दस मिलीलीटर गुनगुने पानी के साथ लें।",
          inStock: true
        },
        {
          name: "Amoxicillin (500mg)",
          category: "Antibiotic",
          purpose: "Bacterial Infection & Sore Throat",
          purposeHi: "बैक्टीरियल इन्फेक्शन और गले का दर्द",
          timing: "Twice daily (morning and night), after food",
          timingHi: "दिन में 2 बार (सुबह व रात), भोजन के बाद",
          icons: "🌅 🌙",
          warning: "Complete full 5-day course as prescribed.",
          warningHi: "डॉक्टर द्वारा बताया गया 5 दिन का कोर्स पूरा करें।",
          voiceTextHi: "एमोक्सीसिल्लिन एंटीबायोटिक इन्फेक्शन के लिए है। खाना खाने के बाद सुबह और शाम लें। पूरा कोर्स जरूर खत्म करें।",
          inStock: true
        },
        {
          name: "Pantoprazole (Pan-40 / Pantocid)",
          category: "Acidity",
          purpose: "Gas, Heartburn & Acidity",
          purposeHi: "पेट में गैस, जलन और एसिडिटी",
          timing: "Empty stomach in the morning, 30 min before breakfast",
          timingHi: "सुबह खाली पेट, नाश्ते से 30 मिनट पहले",
          icons: "🌅 (खाली पेट)",
          warning: "Swallow whole with water, do not crush or chew.",
          warningHi: "पानी के साथ पूरी गोली निगलें, चबाएं नहीं।",
          voiceTextHi: "पेंटोप्राजोल पेट में गैस और एसिडिटी के लिए है। इसे सुबह खाली पेट नाश्ते से आधा घंटा पहले लें।",
          inStock: true
        },
        {
          name: "Cetirizine (10mg)",
          category: "Cold",
          purpose: "Allergy, Sneezing & Runny Nose",
          purposeHi: "एलर्जी, छींकें और बहती नाक",
          timing: "1 tablet at night before sleeping",
          timingHi: "रात को सोने से पहले 1 गोली",
          icons: "🌙 (रात को)",
          warning: "May cause slight drowsiness. Avoid driving.",
          warningHi: "इस दवा से हल्की नींद आ सकती है, गाड़ी न चलाएं।",
          voiceTextHi: "सिट्रीजीन एलर्जी और जुकाम के लिए है। इसे रात को सोने से पहले एक गोली लें।",
          inStock: true
        },
        {
          name: "Diclofenac / Aceclofenac",
          category: "Pain",
          purpose: "Joint, Back & Muscle Pain",
          purposeHi: "जोड़ों का दर्द और सूजन",
          timing: "After meals when pain occurs",
          timingHi: "दर्द होने पर भोजन के बाद",
          icons: "🌅 🌙",
          warning: "Never take on an empty stomach.",
          warningHi: "खाली पेट कभी न लें।",
          voiceTextHi: "यह दवाई जोड़ों और मांसपेशियों के दर्द के लिए है। इसे हमेशा खाना खाने के बाद ही लें।",
          inStock: true
        },
        {
          name: "ORS (Oral Rehydration Salts)",
          category: "Acidity",
          purpose: "Dehydration, Diarrhea & Vomiting",
          purposeHi: "दस्त, उल्टी और डिहाइड्रेशन",
          timing: "Dissolve 1 packet in 1 liter clean water",
          timingHi: "1 लीटर पानी में घोलकर दिन भर पिएं",
          icons: "💧 आवश्यकतानुसार",
          warning: "Consume prepared solution within 24 hours.",
          warningHi: "घोल को 24 घंटे के अंदर ही इस्तेमाल करें।",
          voiceTextHi: "ओआरएस शरीर में पानी की कमी और उल्टी दस्त के लिए है। एक लीटर पानी में घोलकर दिन भर पिएं।",
          inStock: true
        },
        {
          name: "B-Complex + Zinc (Becosules)",
          category: "Vitamins",
          purpose: "Weakness, Mouth Ulcers & Immunity",
          purposeHi: "कमजोरी, मुंह के छाले व रोग प्रतिरोधक क्षमता",
          timing: "Once daily after lunch",
          timingHi: "दिन में 1 बार दोपहर के भोजन के बाद",
          icons: "🌞 (दोपहर)",
          warning: "Drink plenty of water throughout the day.",
          warningHi: "नियमित रूप से पानी अधिक पिएं।",
          voiceTextHi: "बी-कॉम्प्लेक्स कमजोरी और मुंह के छालों के लिए है। दोपहर के खाने के बाद एक कैप्सूल लें।",
          inStock: true
        }
      ];
      await Medicine.insertMany(defaultMedicines);
      console.log("💊 Default village clinic medicines seeded into MongoDB.");
    }
  } catch (err) {
    console.error("Error seeding default medicines:", err);
  }
}

module.exports = { ensurePortalPassword, ensureDefaultDoctors, ensureDefaultMedicines };
