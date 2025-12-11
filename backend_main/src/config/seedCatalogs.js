import prisma from './db.js';

const strokeMedications = [
  {
    medication_name: 'Aspirin 80 mg',
    description: 'Antiplatelet untuk mencegah penggumpalan darah pasca stroke.',
    dosage_standard: '80 mg sekali sehari setelah makan',
    side_effects: 'Nyeri lambung, perdarahan',
    contraindications: 'Riwayat tukak aktif, alergi salisilat',
    image_url: 'https://res-5.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1698985153_telmi_80_novell.jpg',
    manufacturer: 'Novell Pharmaceutical',
    registration_no: 'GKL2033548910A1',
    product_category: 'Antiplatelet'
  },
  {
    medication_name: 'Clopidogrel 75 mg',
    description: 'Antiplatelet alternatif/lanjutan untuk mencegah stroke ulang.',
    dosage_standard: '75 mg sekali sehari',
    side_effects: 'Memar, diare',
    contraindications: 'Perdarahan aktif',
    image_url: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1701364062_clopi_novel-removebg-preview.jpg',
    manufacturer: 'Novell Pharmaceutical Laboratories',
    registration_no: 'GKL1433532017A1',
    product_category: 'Antiplatelet'
  },
  {
    medication_name: 'Atorvastatin 20 mg',
    description: 'Statin menurunkan kolesterol dan risiko kardiovaskular pasca stroke.',
    dosage_standard: '20 mg malam hari',
    side_effects: 'Nyeri otot, peningkatan enzim hati',
    contraindications: 'Penyakit hati aktif',
    image_url: 'https://res-2.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1660815609_5fb3862b41ab59059e869bec.jpg',
    manufacturer: 'Novell Pharmaceutical',
    registration_no: 'GKL1433532017A1',
    product_category: 'Statin'
  },
  {
    medication_name: 'Simvastatin 20 mg',
    description: 'Alternatif statin untuk kontrol lipid pasien stroke.',
    dosage_standard: '20 mg malam hari',
    side_effects: 'Myalgia, peningkatan CK',
    contraindications: 'Penyakit hati aktif',
    image_url: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1708500730_simvas_20-removebg-preview.jpg',
    manufacturer: 'Tempo Scan Pasific',
    registration_no: 'GKL1522724017B1',
    product_category: 'Statin'
  },
  {
    medication_name: 'Captopril 12.5 mg',
    description: 'ACE inhibitor untuk kontrol tekanan darah dan proteksi vaskular.',
    dosage_standard: '12.5 mg 2x sehari',
    side_effects: 'Batuk kering, hipotensi',
    contraindications: 'Kehamilan, stenosis arteri renalis',
    image_url: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1708928069_captopril_12%2C5_mg.jpg',
    manufacturer: 'Kimia Farma',
    registration_no: 'GKL9812516010A1',
    product_category: 'Antihipertensi'
  },
  {
    medication_name: 'Amlodipine 5 mg',
    description: 'Calcium channel blocker untuk kontrol tekanan darah pasca stroke.',
    dosage_standard: '5 mg sekali sehari',
    side_effects: 'Edema perifer, pusing',
    contraindications: 'Hipotensi berat',
    image_url: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1639231650_amlodipine_5_mg_10_tablet.jpg',
    manufacturer: 'Pharos Indonesia',
    registration_no: 'GKL1421644410A1',
    product_category: 'Antihipertensi'
  },
  {
    medication_name: 'Bisoprolol 2.5 mg',
    description: 'Beta blocker untuk pasien stroke dengan komorbid jantung/hipertensi.',
    dosage_standard: '2.5 mg sekali sehari',
    side_effects: 'Bradikardi, kelelahan',
    contraindications: 'Asma berat, blok AV',
    image_url: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1698716634_bisoprolol_5_dexa-removebg-preview.jpg',
    manufacturer: 'Dexa',
    registration_no: 'GKL0305032417A1',
    product_category: 'Antihipertensi'
  },
  {
    medication_name: 'Rivaroxaban 10 mg',
    description: 'DOAC untuk pencegahan stroke non-valvular atrial fibrilasi.',
    dosage_standard: '10 mg sekali sehari bersama makan',
    side_effects: 'Perdarahan, mual',
    contraindications: 'Gagal ginjal berat, kehamilan',
    image_url: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1659764193_xarelto_10_mg_10_tablet.jpg',
    manufacturer: 'Bayer Indonesia',
    registration_no: 'DKI0951602517A1',
    product_category: 'Antikoagulan'
  },
  {
    medication_name: 'Folic Acid 1 mg',
    description: 'Vitamin B9 untuk mendukung perbaikan sel saraf dan homosistein.',
    dosage_standard: '1 mg sekali sehari',
    side_effects: 'Umumnya ditoleransi baik',
    contraindications: 'Alergi folat',
    image_url: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1661158315_62a190f1f15ee840f565ff70.jpg',
    manufacturer: 'Marin Liza Farmasi - Indonesia ',
    registration_no: 'GBL9514103110A1',
    product_category: 'Suplemen'
  },
  {
    medication_name: 'Vitamin B Complex',
    description: 'B1-B6-B12 untuk mendukung regenerasi saraf dan energi.',
    dosage_standard: '1 tablet sekali sehari setelah makan',
    side_effects: 'Mual ringan',
    contraindications: 'Alergi komponen',
    image_url: 'https://res-2.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1659935251_61d696c5e139ec066bb26e47.jpg',
    manufacturer: 'Blackmores',
    registration_no: 'SI164507121',
    product_category: 'Suplemen'
  },
  {
    medication_name: 'Cilostazol 50 mg',
    description: 'Antiplatelet vasodilator untuk sirkulasi perifer dan stroke ringan.',
    dosage_standard: '50 mg 2x sehari sebelum makan',
    side_effects: 'Sakit kepala, palpitasi',
    contraindications: 'Gagal jantung',
    image_url: 'https://res-4.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1660986764_61b322f50e51d9066d3769ff.jpg',
    manufacturer: 'Bernofarm',
    registration_no: 'GKL0502337810A1',
    product_category: 'Antiplatelet'
  },
  {
    medication_name: 'Lisinopril 10 mg',
    description: 'ACE inhibitor untuk kontrol tekanan darah jangka panjang.',
    dosage_standard: '10 mg sekali sehari',
    side_effects: 'Batuk, hipotensi',
    contraindications: 'Kehamilan, stenosis arteri renalis',
    image_url: 'https://res-4.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1685949223_lisinopril.jpg',
    manufacturer: 'Dexa',
    registration_no: 'GKL1405047810B1',
    product_category: 'Antihipertensi'
  },
  {
    medication_name: 'Losartan 50 mg',
    description: 'ARB untuk pasien yang tidak toleran ACE inhibitor.',
    dosage_standard: '50 mg sekali sehari',
    side_effects: 'Pusing, hiperkalemia',
    contraindications: 'Kehamilan, hiperkalemia berat',
    image_url: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1698995454_losartan_hj-removebg-preview.jpg',
    manufacturer: 'Hexpharm',
    registration_no: 'GKL0808515209A1',
    product_category: 'Antihipertensi'
  },
  {
    medication_name: 'Piracetam 800 mg',
    description: 'Nootropic sebagai adjuvan rehabilitasi kognitif pasca stroke.',
    dosage_standard: '800 mg 3x sehari',
    side_effects: 'Gelisa, insomnia ringan',
    contraindications: 'Gagal ginjal berat',
    image_url: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1660978863_61fa5c8dd52ed0392152ed8d.jpg',
    manufacturer: 'Novell Pharmaeutical Laboratories',
    registration_no: 'GKL0533514009A1',
    product_category: 'Nootropik'
  },
  {
    medication_name: 'Citicoline 500 mg',
    description: 'Neuroprotektor untuk mendukung pemulihan fungsi neurologis.',
    dosage_standard: '500 mg 2x sehari',
    side_effects: 'Sakit kepala ringan',
    contraindications: 'Alergi komponen',
    image_url: 'https://res-4.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1710318093_citicoline_dexa_500mg_kaplet-removebg-preview.jpg',
    manufacturer: 'Dexa',
    registration_no: 'SD121543381',
    product_category: 'Neuroprotektor'
  },
  {
    medication_name: 'Gabapentin 300 mg',
    description: 'Adjuvan untuk neuropati pasca stroke dan nyeri',
    dosage_standard: '300 mg 2x sehari, titrasi sesuai respons',
    side_effects: 'Sedasi, pusing',
    contraindications: 'Hati-hati pada gagal ginjal',
    image_url: 'https://res-2.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1659945331_5fb3786b41ab59059e867b85.jpg',
    manufacturer: 'Dexa Medica',
    registration_no: 'GKL1405048101A1',
    product_category: 'Neuropatik'
  },
  {
    medication_name: 'Omeprazole 20 mg',
    description: 'Gastroprotektor untuk pasien yang menggunakan antiplatelet/antikoagulan.',
    dosage_standard: '20 mg sekali sehari sebelum makan',
    side_effects: 'Kembung, sakit kepala',
    contraindications: 'Alergi PPI',
    image_url: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1706493511_ome_20_dexa-removebg-preview.jpg',
    manufacturer: 'Hexpharm',
    registration_no: 'GKL0508512603A1',
    product_category: 'Gastroprotektor'
  },
  {
    medication_name: 'Paracetamol 500 mg',
    description: 'Analgesik antipiretik aman untuk nyeri ringan pasca stroke.',
    dosage_standard: '500 mg tiap 6-8 jam bila perlu (maks 4 g/hari)',
    side_effects: 'Umumnya ditoleransi baik',
    contraindications: 'Gangguan hati berat',
    image_url: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1687334265_paracet_fm.jpg',
    manufacturer: 'First Medifarma',
    registration_no: 'GBL9607102904A1',
    product_category: 'Analgesik'
  }
];

const strokeExercises = [
  {
    exercise_name: 'Seated Marching',
    description: 'Latihan duduk untuk melatih kekuatan kaki dan stabilitas inti.',
    specialization: 'PHYSICAL',
    frequency_per_day: 2,
    duration_minutes: 10,
    image_url: 'https://content.healthwise.net/resources/14.7/en-us/media/medical/hw/h9991900_001.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=1m72e65YZtM',
    instructions: 'Duduk tegak, angkat lutut bergantian 10-15 repetisi per sisi.'
  },
  {
    exercise_name: 'Ankle Pumps',
    description: 'Meningkatkan sirkulasi dan mencegah kekakuan pergelangan kaki.',
    specialization: 'PHYSICAL',
    frequency_per_day: 3,
    duration_minutes: 5,
    image_url: 'https://i.ytimg.com/vi/-twMbBmHwso/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=KxfFzSOAT7g',
    instructions: 'Gerakkan pergelangan kaki ke atas-bawah 15-20 repetisi per sisi.'
  },
  {
    exercise_name: 'Shoulder Flex Slide',
    description: 'Gerakan rentang bahu untuk pasien pasca stroke.',
    specialization: 'OCCUPATIONAL',
    frequency_per_day: 2,
    duration_minutes: 8,
    image_url: 'https://i.ytimg.com/vi/pgsPQ1_5e0w/sddefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=AlMflkn7sM4',
    instructions: 'Gunakan handuk di meja, geser tangan ke depan perlahan, tahan 5 detik.'
  },
  {
    exercise_name: 'Grip and Release',
    description: 'Melatih kekuatan genggam dan koordinasi tangan.',
    specialization: 'OCCUPATIONAL',
    frequency_per_day: 3,
    duration_minutes: 6,
    image_url: 'https://cdn.shopifycdn.net/s/files/1/2350/9323/files/description_image_02.jpg?v=1637810820',
    tutorial_url: 'https://www.youtube.com/watch?v=UodVZEfubhk',
    instructions: 'Genggam bola spons 10-15 kali, istirahat, ulangi 3 set.'
  },
  {
    exercise_name: 'Balloon Toss',
    description: 'Koordinasi mata-tangan ringan dengan balon.',
    specialization: 'RECREATIONAL',
    frequency_per_day: 1,
    duration_minutes: 10,
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgLuzTixGF7CGYuhsUIlc4FUBna7lQznXZ8FyPMrtw-w&s',
    tutorial_url: 'https://www.youtube.com/watch?v=auqZJnGxNuA',
    instructions: 'Lempar-tangkap balon perlahan, fokus kontrol bahu dan siku.'
  },
  {
    exercise_name: 'Music-Assisted Arm Reach',
    description: 'Latihan menyenangkan untuk meningkatkan jangkauan lengan.',
    specialization: 'RECREATIONAL',
    frequency_per_day: 1,
    duration_minutes: 12,
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4JMa48HzsgkQfI13a-r0SLYWGRMqdFcz16A&s',
    tutorial_url: 'https://www.youtube.com/watch?v=a3lZHllLYto',
    instructions: 'Ikuti irama musik, raih benda ringan ke arah berbeda 10 repetisi.'
  },
  {
    exercise_name: 'Tongue Strengthening',
    description: 'Melatih kekuatan lidah untuk membantu menelan dan bicara.',
    specialization: 'SPEECH',
    frequency_per_day: 3,
    duration_minutes: 5,
    image_url: 'https://i.pinimg.com/736x/30/24/e0/3024e05128505a4a3c75d4ee173f61f2.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=Y0KgBbT11Ew',
    instructions: 'Tekan lidah ke langit-langit 5 detik, ulang 10 kali.'
  },
  {
    exercise_name: 'Vowel Prolongation',
    description: 'Melatih artikulasi dan kontrol napas.',
    specialization: 'SPEECH',
    frequency_per_day: 2,
    duration_minutes: 6,
    image_url: 'https://lessonpix.com/actionshots/cover/10035129/335/Vowel%2BProlongation%2B_i_.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=wlqWzHAfSmc',
    instructions: 'Ucapkan vokal “aaa-iii-uuu” 5-7 detik tiap vokal, 5 kali.'
  },
  {
    exercise_name: 'Mood Journal Walk',
    description: 'Latihan ringan untuk mengurangi stres dan meningkatkan mood.',
    specialization: 'PSYCHOLOGIST',
    frequency_per_day: 1,
    duration_minutes: 15,
    image_url: 'https://img.youtube.com/vi/Ls3G_FduOIw/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=Ls3G_FduOIw',
    instructions: 'Jalan santai 10-15 menit sambil mencatat perasaan sebelum-sesudah.'
  },
  {
    exercise_name: 'Box Breathing',
    description: 'Teknik napas untuk kecemasan dan fokus.',
    specialization: 'PSYCHOLOGIST',
    frequency_per_day: 2,
    duration_minutes: 5,
    image_url: 'https://img.youtube.com/vi/tEmt1Znux58/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
    instructions: 'Tarik napas 4 detik, tahan 4, buang 4, tahan 4; ulang 6-8 siklus.'
  },
  {
    exercise_name: 'Chair Sit-to-Stand',
    description: 'Melatih kekuatan tungkai dan kemandirian fungsional.',
    specialization: 'PHYSICAL',
    frequency_per_day: 2,
    duration_minutes: 8,
    image_url: 'https://img.youtube.com/vi/FgzjxOnWYvA/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=FgzjxOnWYvA',
    instructions: 'Bangun-duduk kursi 10-12 repetisi, gunakan tangan bila perlu.'
  },
  {
    exercise_name: 'Heel Slides',
    description: 'Meningkatkan ROM lutut dan pinggul secara aman.',
    specialization: 'PHYSICAL',
    frequency_per_day: 2,
    duration_minutes: 6,
    image_url: 'https://img.youtube.com/vi/4_ssBADWinU/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=4_ssBADWinU',
    instructions: 'Dalam posisi terlentang, geser tumit ke arah bokong 10-15 repetisi.'
  },
  {
    exercise_name: 'Finger Opposition',
    description: 'Melatih koordinasi halus jari tangan.',
    specialization: 'OCCUPATIONAL',
    frequency_per_day: 3,
    duration_minutes: 5,
    image_url: 'https://img.youtube.com/vi/fU189t67VlM/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=fU189t67VlM',
    instructions: 'Sentuhkan ibu jari ke tiap ujung jari 10 kali, lalu ganti tangan.'
  },
  {
    exercise_name: 'Bed Mobility Roll',
    description: 'Melatih kemampuan berguling dan mobilitas dasar.',
    specialization: 'PHYSICAL',
    frequency_per_day: 2,
    duration_minutes: 6,
    image_url: 'https://img.youtube.com/vi/IgIz4D4ecv0/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=IgIz4D4ecv0',
    instructions: 'Guling kanan-kiri dengan bantuan tangan, 6-8 repetisi.'
  },
  {
    exercise_name: 'Seated Scapular Retraction',
    description: 'Postur bahu untuk mencegah nyeri dan meningkatkan stabilitas.',
    specialization: 'PHYSICAL',
    frequency_per_day: 2,
    duration_minutes: 5,
    image_url: 'https://img.youtube.com/vi/WklUZWulQao/maxresdefault.jpg',
    tutorial_url: 'https://www.youtube.com/watch?v=WklUZWulQao',
    instructions: 'Tarik tulang belikat ke belakang, tahan 5 detik, ulang 10-12 kali.'
  }
];

const nutritionCatalog = [
  {
    food_name: 'Oatmeal dengan buah beri',
    description: 'Serat tinggi, membantu kontrol kolesterol.',
    food_category: 'main_course',
    meal_type: 'breakfast',
    image_url: 'https://www.pcrm.org/sites/default/files/Oatmeal%20and%20Berries.jpg',
    calories: 320,
    sodium_mg: 120,
    fiber_g: 8
  },
  {
    food_name: 'Ikan salmon panggang',
    description: 'Omega-3 untuk kesehatan otak dan jantung.',
    food_category: 'main_course',
    meal_type: 'dinner',
    image_url: 'https://api.photon.aremedia.net.au/wp-content/uploads/sites/12/media/44356/roasted-citrus-salmon.jpg?resize=682%2C1023',
    calories: 360,
    sodium_mg: 150,
    fiber_g: 0
  },
  {
    food_name: 'Sup sayur rendah garam',
    description: 'Hidrasi, vitamin, dan mineral tanpa kelebihan sodium.',
    food_category: 'vegetable',
    meal_type: 'lunch',
    image_url: 'https://www.cookingclassy.com/wp-content/uploads/2014/10/vegetable-soup-7.jpg',
    calories: 180,
    sodium_mg: 180,
    fiber_g: 5
  },
  {
    food_name: 'Tumis bayam dan jamur',
    description: 'Sumber zat besi dan antioksidan, rendah garam.',
    food_category: 'vegetable',
    meal_type: 'lunch',
    image_url: 'https://www.justataste.com/wp-content/uploads/2009/03/spinach-mushrooms-garlic.jpg',
    calories: 140,
    sodium_mg: 110,
    fiber_g: 4
  },
  {
    food_name: 'Smoothie alpukat yogurt rendah lemak',
    description: 'Lemak sehat, probiotik, membantu pemulihan.',
    food_category: 'beverages',
    meal_type: 'breakfast',
    image_url: 'https://www.dianekochilas.com/wp-content/uploads/2021/01/avocado-yogurt-greek-honey-smoothie-500x500.jpg',
    calories: 250,
    sodium_mg: 90,
    fiber_g: 5
  },
  {
    food_name: 'Infused Water',
    description: 'Hidrasi tanpa kalori, membantu kontrol tekanan darah.',
    food_category: 'beverages',
    meal_type: 'snack',
    image_url: 'https://s3-publishing-cmn-svc-prd.s3.ap-southeast-1.amazonaws.com/article/n1-N3EIolcgxAUP3vuptm/original/086886500_1550828061-Benarkah-Infused-Water-Lebih-Sehat-dari-Air-Minum-Biasa-By-Tatiana-Bralnina-Shutterstock.jpg',
    calories: 10,
    sodium_mg: 5,
    fiber_g: 0
  },
  {
    food_name: 'Kacang almond panggang tanpa garam',
    description: 'Lemak tak jenuh dan magnesium untuk kesehatan saraf.',
    food_category: 'snack',
    meal_type: 'snack',
    image_url: 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2023/02/Almonds-Table-Bowl-1296x728-Header.jpg?w=1155&h=1528',
    calories: 180,
    sodium_mg: 5,
    fiber_g: 4
  },
  {
    food_name: 'Brokoli kukus dengan minyak zaitun',
    description: 'Serat dan antioksidan tinggi, mendukung tekanan darah stabil.',
    food_category: 'vegetable',
    meal_type: 'dinner',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN-56aJ_NnWSMtb4fluA7UyFOpXFZCLVgBLg&s',
    calories: 120,
    sodium_mg: 70,
    fiber_g: 5
  },
  {
    food_name: 'Dada ayam panggang tanpa kulit',
    description: 'Protein tinggi rendah lemak untuk perbaikan otot.',
    food_category: 'main_course',
    meal_type: 'lunch',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPEQl2C3DVVLKJ5suRcGooiCWXMDXi3aW5jA&s',
    calories: 280,
    sodium_mg: 140,
    fiber_g: 0
  },
  {
    food_name: 'Roti gandum utuh',
    description: 'Karbohidrat kompleks dengan indeks glikemik rendah.',
    food_category: 'main_course',
    meal_type: 'breakfast',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcMD45JRqz3linBj9CPkcHYAL44Vj3yP9kIA&s',
    calories: 160,
    sodium_mg: 130,
    fiber_g: 6
  },
  {
    food_name: 'Buah berry campur',
    description: 'Antioksidan tinggi, rendah kalori untuk camilan.',
    food_category: 'snack',
    meal_type: 'snack',
    image_url: 'https://www.realsimple.com/thmb/h4BMDxUEB1nibsFKSS3eOipxCyg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/what-is-the-healthiest-berry-realsimple-GettyImages-889651610-57233cfb91cb4009bba9c16fb0a54221.jpg',
    calories: 90,
    sodium_mg: 5,
    fiber_g: 4
  },
  {
    food_name: 'Yogurt rendah lemak plain',
    description: 'Probiotik dan protein, cocok untuk sarapan/snack.',
    food_category: 'snack',
    meal_type: 'breakfast',
    image_url: 'https://www.batamnews.co.id/foto_berita//40ky.PNG',
    calories: 140,
    sodium_mg: 90,
    fiber_g: 0
  }
];

export { strokeMedications, strokeExercises, nutritionCatalog };

export const seedCatalogs = async () => {
  try {
    // Seed medication catalog
    for (const med of strokeMedications) {
      const existing = await prisma.medication_catalogs.findFirst({
        where: { medication_name: med.medication_name }
      });
      if (!existing) {
        await prisma.medication_catalogs.create({ data: med });
      }
    }

    // Seed exercise catalog
    for (const ex of strokeExercises) {
      const existing = await prisma.exercise_catalogs.findFirst({
        where: { exercise_name: ex.exercise_name }
      });
      if (!existing) {
        await prisma.exercise_catalogs.create({ data: ex });
      }
    }

    // Seed nutrition catalog
    for (const food of nutritionCatalog) {
      const existing = await prisma.nutrition_food_catalogs.findFirst({
        where: { food_name: food.food_name }
      });
      if (!existing) {
        await prisma.nutrition_food_catalogs.create({ data: food });
      }
    }

    console.log('[seed] Catalogs ensured.');
  } catch (err) {
    console.error('[seed] Failed to seed catalogs', err.message);
  }
};
