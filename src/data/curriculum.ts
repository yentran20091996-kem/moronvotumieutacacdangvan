import {
  BadgeDefinition,
  PillarId,
  PillarInfo,
  QuizQuestion,
  StoryAdventure,
  VocabItem,
} from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_journey_notebook_1795333309775.jpg';

export const PILLARS: PillarInfo[] = [
  {
    id: 'storytelling',
    number: '01',
    title: 'Kể chuyện sáng tạo',
    shortTitle: 'Kể chuyện',
    subtitle: 'Xây dựng cốt truyện hấp dẫn, nút thắt bất ngờ và lời thoại có hồn.',
    image: '/src/assets/images/pillar_storytelling_1795333309336.jpg',
    surfaceTint: 'rose',
    pedagogicalMethod: 'Phương pháp Sơ đồ 3 chặng & Nhập vai nhân vật',
    methodDetail:
      'Hãy tưởng tượng mình là một nhân vật nhỏ bé bước vào câu chuyện. Đặt câu hỏi: "Điều gì bất ngờ sắp xảy ra?" và thêm cảm xúc, lời nói tự nhiên để người đọc hồi hộp theo dõi.',
    keyElements: [
      'Mở đầu tự nhiên (giới thiệu không gian, nhân vật)',
      'Thắt nút bất ngờ (tình huống khó khăn hoặc bí mật)',
      'Mở nút ấm áp (cách giải quyết sáng tạo và bài học)',
      'Lời thoại và cử chỉ thể hiện tính cách nhân vật',
    ],
    outline: {
      opening: 'Giới thiệu hoàn cảnh xảy ra câu chuyện (thời gian, địa điểm, nhân vật chính đang làm gì).',
      body: [
        'Sự việc khởi đầu dẫn dắt vào hành trình hoặc cuộc gặp gỡ thú vị.',
        'Đỉnh điểm (thắt nút): Nhân vật gặp thử thách, hiểu lầm hoặc tình huống bất ngờ.',
        'Mở nút: Nhờ lòng tốt, sự thông minh hoặc tình bạn, nhân vật vượt qua khó khăn.',
      ],
      closing: 'Kết thúc nhẹ nhàng kèm cảm xúc đọng lại hoặc lời nhắn gửi ý nghĩa của Bạn nhỏ.',
    },
    sampleSimpleSentence: 'Chiếc thuyền giấy trôi trên dòng suối rất nhanh.',
    sampleCheckText:
      'Hôm qua em đi học về thì thấy một chú mèo con bị ướt. Chú mèo kêu rất to. Em liền mang chú mèo về nhà lau khô cho chú mèo. Em cảm thấy rất vui.',
    practicePrompts: [
      'Kể lại chuyến phiêu lưu của một chiếc thuyền giấy mang theo điều ước.',
      'Đóng vai một quyển vở cũ kể lại kỷ niệm đáng nhớ nhất cùng cô cậu học trò lớp 5.',
      'Kể một câu chuyện nhỏ về lần Bạn nhỏ dũng cảm nhận lỗi hoặc giúp đỡ một người bạn mới.',
    ],
    storytellingModes: {
      add_details: {
        id: 'add_details',
        label: 'Cách 1: Thêm các chi tiết sáng tạo',
        shortLabel: 'Thêm chi tiết sáng tạo',
        summary:
          'Giữ nguyên cốt truyện quen thuộc hoặc ý tưởng chính, rồi tô điểm thêm tả cảnh, tả ngoại hình, cử chỉ, âm thanh và lời thoại sinh động.',
        pedagogicalTip:
          'Dừng lại ở mỗi sự việc quan trọng và tự hỏi: "Lúc ấy khung cảnh xung quanh ra sao? Nhân vật có nét mặt, cử chỉ gì? Nhân vật đã nói câu gì thật tự nhiên?"',
        pronounHint: 'Kể linh hoạt ở ngôi thứ ba (gọi tên nhân vật) hoặc ngôi người quan sát.',
        outline: {
          opening:
            'Mở rộng bối cảnh thời gian, ánh sáng, không gian xung quanh trước khi giới thiệu nhân vật chính.',
          body: [
            'Thêm chi tiết tả ngoại hình, điệu bộ đặc trưng khiến nhân vật hiện lên sống động như phim.',
            'Ở đoạn thắt nút: thêm âm thanh, thời tiết hoặc tình huống nhỏ làm tăng cảm giác hồi hộp.',
            'Ở đoạn mở nút: bổ sung một đoạn lời thoại tự nhiên và hành động đẹp thể hiện tấm lòng nhân vật.',
          ],
          closing:
            'Khép lại bằng hình ảnh dư âm đẹp mắt cùng bài học ý nghĩa nhẹ nhàng đọng lại trong lòng người đọc.',
        },
        sampleSimpleSentence: 'Chiếc thuyền giấy trôi trên dòng suối rất nhanh.',
        sampleCheckText:
          'Hôm qua em đi học về thì thấy một chú mèo con bị ướt. Chú mèo kêu rất to. Em liền mang chú mèo về nhà lau khô cho chú mèo. Em cảm thấy rất vui.',
        practicePrompts: [
          'Kể lại câu chuyện "Cây khế" bằng cách thêm chi tiết tả khu vườn, dáng vẻ chim phượng hoàng và cảm xúc của người em.',
          'Kể chuyến phiêu lưu của chiếc thuyền giấy có thêm cảnh đàn đom đóm, tiếng suối róc rách và cuộc trò chuyện với chú ếch xanh.',
          'Kể lại một buổi chiều giúp bạn nhặt vở bị gió thổi bay bằng cách thêm các chi tiết tả cơn gió và nụ cười rạng rỡ.',
        ],
      },
      roleplay: {
        id: 'roleplay',
        label: 'Cách 2: Đóng vai thành nhân vật kể lại',
        shortLabel: 'Đóng vai nhân vật',
        summary:
          'Hóa thân trực tiếp thành một nhân vật (con người, con vật hoặc đồ vật trong truyện), xưng "tôi" / "mình" để kể lại mọi việc theo góc nhìn và cảm xúc riêng.',
        pedagogicalTip:
          'Hãy "đội mũ" của nhân vật: Nếu mình là Chiếc Thuyền Giấy, Chú Mèo Mướp hay Cây Khế trong vườn, mình sẽ nhìn thấy gì, nghĩ gì trong bụng và rung động ra sao?',
        pronounHint: 'Thống nhất ngôi kể thứ nhất: xưng "tôi", "mình", hoặc "cháu" từ đầu đến cuối truyện.',
        outline: {
          opening:
            'Tự giới thiệu "Tôi là ai?", đang ở đâu và tâm trạng háo hức hay tò mò trước khi câu chuyện bắt đầu.',
          body: [
            'Kể lại diễn biến sự việc qua đúng đôi mắt quan sát của nhân vật (chỉ kể những gì nhân vật nhìn thấy, nghe thấy).',
            'Ở đoạn thắt nút: bộc lộ rõ nỗi lo lắng, suy nghĩ thầm kín hoặc quyết tâm dũng cảm trong lòng "tôi".',
            'Ở đoạn mở nút: kể cảm giác vỡ òa nhẹ nhõm, vui sướng và lời trò chuyện với những nhân vật khác.',
          ],
          closing:
            'Nhân vật tự rút ra kỷ niệm không thể quên hoặc gửi một lời nhắn đáng yêu tới các bạn nhỏ đọc truyện.',
        },
        sampleSimpleSentence: 'Tôi là một chiếc thuyền giấy nhỏ đang trôi trên con suối.',
        sampleCheckText:
          'Tôi là cây phượng già ở góc sân trường. Hằng ngày tôi đứng nhìn các bạn học sinh đi học. Mùa hè tôi nở hoa đỏ. Tôi rất vui khi các bạn ngồi chơi dưới bóng mát của tôi.',
        sampleCharacters: [
          'Chiếc thuyền giấy nhỏ',
          'Cây phượng già sân trường',
          'Chú mèo mướp nhỏ',
          'Viên phấn trắng út',
          'Chú chim ăn khế',
        ],
        practicePrompts: [
          'Đóng vai chiếc thuyền giấy (xưng "tôi") kể lại chuyến du ngoạn kỳ thú qua dòng suối quê hương.',
          'Đóng vai cây khế trong câu chuyện cổ tích "Ăn khế trả vàng" kể lại tấm lòng hiền hậu của người em.',
          'Đóng vai quyển sách Tiếng Việt lớp 5 kể về một ngày học tập vui vẻ cùng cô cậu chủ nhỏ.',
        ],
      },
    },
  },
  {
    id: 'plants',
    number: '02',
    title: 'Tả cây cối',
    shortTitle: 'Tả cây cối',
    subtitle: 'Quan sát tinh tế từng bộ phận và sự chuyển mình kỳ diệu theo bốn mùa.',
    image: '/src/assets/images/pillar_plants_1795333309375.jpg',
    surfaceTint: 'mint',
    pedagogicalMethod: 'Phương pháp Quan sát 5 giác quan & Trình tự không gian',
    methodDetail:
      'Quan sát từ xa đến gần, từ gốc lên ngọn: Mắt thấy màu sắc gì? Tay chạm vào vỏ cây thấy xù xì hay mịn màng? Mũi ngửi thấy hương thơm ra sao? Tai nghe tiếng lá xào xạc thế nào?',
    keyElements: [
      'Bao quát dáng cây từ xa (như chiếc ô xanh, ngọn đuốc đỏ...)',
      'Tả chi tiết rễ, thân, cành, tán lá, hoa và quả',
      'Sự thay đổi của cây theo nắng gió hoặc bốn mùa xuân - hạ - thu - đông',
      'Kỷ niệm gắn bó giữa cây với Bạn nhỏ hoặc mái trường',
    ],
    outline: {
      opening: 'Giới thiệu cây định tả (trồng ở đâu, ai trồng, ấn tượng đầu tiên khi nhìn thấy).',
      body: [
        'Tả bao quát: Chiều cao, dáng đứng, màu sắc nổi bật khi nhìn từ xa.',
        'Tả từng bộ phận: Bộ rễ ngoằn ngoèo, thân cây chắc khỏe, tán lá xanh rì, sắc hoa rực rỡ hay hương quả ngọt lành.',
        'Tả sự gắn bó với thiên nhiên (chim chóc, nắng gió, ong bướm) và con người.',
      ],
      closing: 'Nêu ích lợi của cây và tình cảm yêu quý, cách chăm sóc của Bạn nhỏ dành cho cây.',
    },
    sampleSimpleSentence: 'Hoa hồng rất đẹp.',
    sampleCheckText:
      'Ở góc sân trường em có trồng một cây phượng rất to. Thân cây màu nâu và rất sần sùi. Mùa hè hoa phượng nở đỏ rực rất đẹp. Em rất thích chơi dưới gốc cây phượng.',
    practicePrompts: [
      'Tả một khóm hoa hồng nhung còn đọng sương sớm trong khu vườn nhà em.',
      'Tả cây phượng vĩ già tỏa bóng mát trên sân trường mỗi dịp hè về.',
      'Tả một cây ăn quả mà em yêu thích (cây xoài, cây bưởi, cây nhãn...) vào mùa chín rộ.',
    ],
  },
  {
    id: 'scenery',
    number: '03',
    title: 'Tả cảnh',
    shortTitle: 'Tả cảnh',
    subtitle: 'Vẽ nên bức tranh không gian ngập tràn ánh sáng, âm thanh và nhịp sống.',
    image: '/src/assets/images/pillar_scenery_1795333309996.jpg',
    surfaceTint: 'lemon',
    pedagogicalMethod: 'Phương pháp Ống kính Điện ảnh (Toàn cảnh -> Cận cảnh -> Chuyển động)',
    methodDetail:
      'Hãy tưởng tượng mắt mình là một chiếc máy quay phim: lia rộng khắp bầu trời, mặt đất, rồi phóng gần vào dòng sông, hàng tre, tiếng chim hót và nhịp sống sinh hoạt của con người.',
    keyElements: [
      'Chọn thời điểm vàng (bình minh, trưa hè, hoàng hôn hay cơn mưa rào)',
      'Kết hợp màu sắc của ánh sáng với chuyển động của gió, mây, mặt nước',
      'Đan xen âm thanh tự nhiên để bức tranh có sức sống',
      'Hình ảnh con người sinh hoạt hài hòa trong khung cảnh',
    ],
    outline: {
      opening: 'Giới thiệu cảnh vật em chọn tả (ở đâu, vào thời điểm nào trong ngày hoặc trong năm).',
      body: [
        'Tả bao quát không gian: Bầu trời, làn gió, bầu không khí chung.',
        'Tả từng nét nổi bật theo thứ tự (từ trên xuống dưới hoặc từ xa đến gần: nắng, mây, cánh đồng, dòng sông, hàng cây).',
        'Tả nhịp sống: Hoạt động của chim muông, con người làm bức tranh thêm rộn rã hoặc yên bình.',
      ],
      closing: 'Bộc lộ cảm xúc yêu mến, tự hào về vẻ đẹp quê hương hay nơi chốn thân quen.',
    },
    sampleSimpleSentence: 'Buổi sáng ở quê em rất đẹp và yên bình.',
    sampleCheckText:
      'Buổi sáng trên cánh đồng lúa quê em rất mát mẻ. Mặt trời mọc lên màu đỏ. Những bông lúa vàng óng đung đưa trong gió. Xa xa có mấy chú cò trắng bay qua rất đẹp.',
    practicePrompts: [
      'Tả cánh đồng lúa chín vàng quê em vào một buổi sáng bình minh trong trẻo.',
      'Tả một cơn mưa rào bất chợt vào buổi chiều mùa hạ.',
      'Tả khung cảnh sân trường em trong giờ ra chơi rộn rã tiếng cười.',
    ],
  },
  {
    id: 'people',
    number: '04',
    title: 'Tả người',
    shortTitle: 'Tả người',
    subtitle: 'Khắc họa chân dung thân thương qua ngoại hình, ánh mắt, nụ cười và tính cách.',
    image: '/src/assets/images/pillar_people_1795333309627.jpg',
    surfaceTint: 'rose',
    pedagogicalMethod: 'Phương pháp Điểm nhấn Chân dung & Kỷ niệm Biết nói',
    methodDetail:
      'Không cần liệt kê mọi chi tiết từ đầu đến chân. Hãy chọn 2–3 nét ấn tượng nhất (mái tóc bạc, đôi bàn tay gầy ấm áp, nụ cười rạng rỡ) rồi kể một hành động nhỏ thể hiện rõ tấm lòng của người ấy.',
    keyElements: [
      'Ngoại hình tiêu biểu gắn với tuổi tác, nghề nghiệp',
      'Ánh mắt, nụ cười, giọng nói giàu biểu cảm',
      'Tính cách thể hiện qua cử chỉ, thói quen hằng ngày',
      'Một kỷ niệm chân thành khiến em nhớ mãi',
    ],
    outline: {
      opening: 'Giới thiệu người em định tả là ai (ông bà, bố mẹ, thầy cô hoặc người bạn thân) và ấn tượng sâu sắc nhất.',
      body: [
        'Tả ngoại hình nổi bật: Vóc dáng, khuôn mặt, mái tóc, đôi mắt, đôi bàn tay.',
        'Tả tính cách và hoạt động: Cách nói chuyện, dáng vẻ khi làm việc hay khi quan tâm, chăm sóc em.',
        'Kể ngắn một kỷ niệm nhỏ làm nổi bật tình cảm giữa hai người.',
      ],
      closing: 'Bày tỏ lòng biết ơn, tình yêu thương và mong ước của em dành cho người ấy.',
    },
    sampleSimpleSentence: 'Bà ngoại em rất hiền và yêu thương em.',
    sampleCheckText:
      'Mẹ em năm nay ba mươi lăm tuổi. Mẹ có mái tóc đen dài và khuôn mặt tròn. Mẹ rất chăm chỉ, sáng nào mẹ cũng dậy sớm nấu ăn cho cả nhà. Em rất thương mẹ.',
    practicePrompts: [
      'Tả người bà hiền hậu luôn kể chuyện cổ tích cho em nghe mỗi tối.',
      'Tả thầy giáo hoặc cô giáo lớp 5 đã tận tình dìu dắt em.',
      'Tả người bạn thân cùng bàn có nụ cười rạng rỡ và hay giúp đỡ mọi người.',
    ],
  },
];

export const PILLAR_MAP: Record<PillarId, PillarInfo> = {
  storytelling: PILLARS[0],
  plants: PILLARS[1],
  scenery: PILLARS[2],
  people: PILLARS[3],
};

export const VOCABULARY_LIBRARY: VocabItem[] = [
  // Kể chuyện sáng tạo
  {
    id: 'v-st-1',
    word: 'hồi hộp',
    pillar: 'storytelling',
    category: 'Từ láy',
    meaning: 'Tâm trạng bồn chồn, tim đập nhanh vì mong chờ điều sắp xảy ra.',
    example: 'Tim tôi đập thình thịch, hồi hộp mở chiếc hộp gỗ nhỏ giấu dưới gốc bàng.',
  },
  {
    id: 'v-st-2',
    word: 'rón rén',
    pillar: 'storytelling',
    category: 'Từ láy',
    meaning: 'Bước đi thật khẽ, nhẹ nhàng vì sợ phát ra tiếng động.',
    example: 'Chú mèo mướp rón rén từng bước trên bậc thềm để không làm tôi giật mình.',
  },
  {
    id: 'v-st-3',
    word: 'lấp lánh như ngàn vì sao lạc xuống dòng suối',
    pillar: 'storytelling',
    category: 'So sánh',
    meaning: 'Tả ánh sáng nhỏ bé nhưng kỳ diệu, tạo không khí cổ tích.',
    example: 'Đàn đom đóm chập chờn quanh chiếc thuyền giấy, lấp lánh như ngàn vì sao lạc xuống dòng suối.',
  },
  {
    id: 'v-st-4',
    word: 'lặng lẽ lắng nghe',
    pillar: 'storytelling',
    category: 'Nhân hóa',
    meaning: 'Cho đồ vật hoặc thiên nhiên biết cảm nhận câu chuyện cùng nhân vật.',
    example: 'Chiếc đồng hồ gỗ trên tường cũng ngừng gõ nhịp ồn ã, lặng lẽ lắng nghe lời thì thầm của hai chị em.',
  },
  {
    id: 'v-st-5',
    word: 'lúng túng',
    pillar: 'storytelling',
    category: 'Từ láy',
    meaning: 'Vẻ bối rối, chưa biết xoay xở hay nói thế nào cho phải.',
    example: 'Nghe cô hỏi, Minh lúng túng vân vê vạt áo rồi khẽ ngẩng đầu nhận lỗi.',
  },
  {
    id: 'v-st-6',
    word: 'rộn rã',
    pillar: 'storytelling',
    category: 'Âm thanh & Hình dáng',
    meaning: 'Âm thanh vui tươi, nối tiếp nhau làm không khí trở nên sôi nổi.',
    example: 'Nút thắt vừa được tháo gỡ, cả khoảng sân bỗng rộn rã tiếng cười giòn tan.',
  },
  {
    id: 'v-st-7',
    word: 'như một phép màu dịu dàng',
    pillar: 'storytelling',
    category: 'So sánh',
    meaning: 'Diễn tả điều tốt đẹp bất ngờ xuất hiện đúng lúc cần nhất.',
    example: 'Lời động viên của bạn đến đúng lúc ấy như một phép màu dịu dàng xua tan nỗi lo trong lòng tôi.',
  },
  {
    id: 'v-st-8',
    word: 'ánh đèn vàng ấm áp',
    pillar: 'storytelling',
    category: 'Màu sắc & Ánh sáng',
    meaning: 'Màu ánh sáng gợi cảm giác an toàn, sum vầy và thân thương.',
    example: 'Ánh đèn vàng ấm áp từ ô cửa sổ nhà bà như vẫy gọi bước chân tôi quay về.',
  },
  {
    id: 'v-st-9',
    word: 'thầm thì kể chuyện',
    pillar: 'storytelling',
    category: 'Nhân hóa',
    meaning: 'Khiến gió, suối hoặc trang sách như biết trò chuyện thủ thỉ.',
    example: 'Làn gió đêm khẽ luồn qua khe cửa, thầm thì kể chuyện về những miền đất xa xôi.',
  },

  // Tả cây cối
  {
    id: 'v-pl-1',
    word: 'mơn mởn',
    pillar: 'plants',
    category: 'Từ láy',
    meaning: 'Vẻ tươi non, đầy sức sống của chồi lá hay mầm cây mới nhú.',
    example: 'Sau cơn mưa xuân, những búp bàng non xanh mơn mởn thi nhau bật khỏi cành khô.',
  },
  {
    id: 'v-pl-2',
    word: 'xum xuê',
    pillar: 'plants',
    category: 'Từ láy',
    meaning: 'Cành lá mọc rậm rạp, tỏa rộng và rất tươi tốt.',
    example: 'Tán xoài xum xuê đan kín vào nhau, che rợp cả một góc vườn đầy nắng.',
  },
  {
    id: 'v-pl-3',
    word: 'đỏ thắm',
    pillar: 'plants',
    category: 'Màu sắc & Ánh sáng',
    meaning: 'Màu đỏ tươi đậm, rực rỡ nhưng rất mềm mại, sang trọng.',
    example: 'Những đóa hồng nhung đỏ thắm hé nở, khoe sắc rực rỡ trong nắng mai.',
  },
  {
    id: 'v-pl-4',
    word: 'xù xì',
    pillar: 'plants',
    category: 'Âm thanh & Hình dáng',
    meaning: 'Bề mặt vỏ cây thô ráp, có nhiều vết nứt gợi dấu ấn thời gian.',
    example: 'Thân cây phượng già xù xì màu nâu sẫm, mang theo bao dấu vết của nắng mưa.',
  },
  {
    id: 'v-pl-5',
    word: 'như chiếc ô xanh khổng lồ',
    pillar: 'plants',
    category: 'So sánh',
    meaning: 'So sánh tán cây rộng lớn với chiếc ô che nắng cho học sinh.',
    example: 'Từ xa nhìn lại, cây bàng sân trường như chiếc ô xanh khổng lồ tỏa bóng mát rượi.',
  },
  {
    id: 'v-pl-6',
    word: 'khoác trên mình tấm áo choàng nhung mịn màng',
    pillar: 'plants',
    category: 'Nhân hóa',
    meaning: 'Nhân hóa bông hoa như nàng công chúa mặc áo đẹp lộng lẫy.',
    example: 'Đóa hồng nhung khoác trên mình tấm áo choàng nhung mịn màng còn đọng hạt sương long lanh.',
  },
  {
    id: 'v-pl-7',
    word: 'rung rinh',
    pillar: 'plants',
    category: 'Từ láy',
    meaning: 'Chuyển động nhẹ nhàng, đung đưa liên tiếp trước làn gió thoảng.',
    example: 'Từng chùm hoa phượng đỏ rực rung rinh trong gió hè như những ngọn đuốc nhỏ.',
  },
  {
    id: 'v-pl-8',
    word: 'xào xạc',
    pillar: 'plants',
    category: 'Âm thanh & Hình dáng',
    meaning: 'Tiếng lá cây chạm nhẹ vào nhau khi gió thổi qua.',
    example: 'Mỗi buổi trưa, hàng tre sau nhà lại cất lên bản nhạc xào xạc ru em ngủ.',
  },
  {
    id: 'v-pl-9',
    word: 'vươn vai đón nắng sớm',
    pillar: 'plants',
    category: 'Nhân hóa',
    meaning: 'Tả dáng cây buổi sáng thức dậy tràn đầy năng lượng như con người.',
    example: 'Khi mặt trời vừa ló rạng, cả khu vườn như vươn vai đón nắng sớm trong trẻo.',
  },

  // Tả cảnh
  {
    id: 'v-sc-1',
    word: 'trong vắt',
    pillar: 'scenery',
    category: 'Màu sắc & Ánh sáng',
    meaning: 'Rất trong trẻo, sáng rõ không một gợn đục (dùng tả bầu trời, dòng nước).',
    example: 'Bầu trời mùa thu cao vời vợi và trong vắt, điểm xuyết vài áng mây trắng bông.',
  },
  {
    id: 'v-sc-2',
    word: 'vàng óng ả',
    pillar: 'scenery',
    category: 'Màu sắc & Ánh sáng',
    meaning: 'Màu vàng tươi sáng, bóng mượt và trải rộng đầy sức sống.',
    example: 'Cánh đồng lúa chín vàng óng ả trải dài tít tắp đến tận chân đê.',
  },
  {
    id: 'v-sc-3',
    word: 'lấp lóa',
    pillar: 'scenery',
    category: 'Màu sắc & Ánh sáng',
    meaning: 'Ánh nắng phản chiếu trên mặt nước sáng chói và lay động liên tục.',
    example: 'Ánh nắng sớm rải xuống mặt sông quê lấp lóa như dát một lớp bạc mỏng.',
  },
  {
    id: 'v-sc-4',
    word: 'uốn lượn như dải lụa mềm',
    pillar: 'scenery',
    category: 'So sánh',
    meaning: 'Tả dáng dòng sông hoặc con đường làng cong cong, duyên dáng.',
    example: 'Con sông nhỏ uốn lượn như dải lụa mềm vắt ngang qua cánh đồng xanh mát.',
  },
  {
    id: 'v-sc-5',
    word: 'bừng tỉnh sau giấc ngủ dài',
    pillar: 'scenery',
    category: 'Nhân hóa',
    meaning: 'Miêu tả cảnh vật buổi sáng bắt đầu rộn ràng nhịp sống mới.',
    example: 'Tiếng gà gáy vang lên khiến cả ngôi làng êm đềm như bừng tỉnh sau giấc ngủ dài.',
  },
  {
    id: 'v-sc-6',
    word: 'ríu rít',
    pillar: 'scenery',
    category: 'Âm thanh & Hình dáng',
    meaning: 'Tiếng chim hót nối tiếp nhau, nghe trong trẻo và vui tai.',
    example: 'Trên những vòm lá cao, đàn chim sâu gọi nhau ríu rít chào ngày mới.',
  },
  {
    id: 'v-sc-7',
    word: 'lững lờ',
    pillar: 'scenery',
    category: 'Từ láy',
    meaning: 'Trôi thật chậm rãi, thong thả, tạo cảm giác bình yên.',
    example: 'Vài đám mây trắng lững lờ trôi ngang đỉnh núi xa mờ sương sớm.',
  },
  {
    id: 'v-sc-8',
    word: 'tí tách',
    pillar: 'scenery',
    category: 'Âm thanh & Hình dáng',
    meaning: 'Tiếng những giọt mưa đầu tiên rơi nhẹ lên mái hiên hay tàu lá.',
    example: 'Mưa bắt đầu rơi tí tách trên tàu lá chuối rồi bất chợt ào ào đổ xuống sân.',
  },
  {
    id: 'v-sc-9',
    word: 'như bức tranh thủy mặc dịu êm',
    pillar: 'scenery',
    category: 'So sánh',
    meaning: 'So sánh phong cảnh quê hương đẹp hài hòa, thanh bình như tranh vẽ.',
    example: 'Hoàng hôn buông xuống, bến sông quê hiện lên như bức tranh thủy mặc dịu êm.',
  },

  // Tả người
  {
    id: 'v-pe-1',
    word: 'hiền hậu',
    pillar: 'people',
    category: 'Âm thanh & Hình dáng',
    meaning: 'Vẻ hiền lành, nhân ái và bao dung hiện rõ trên nét mặt.',
    example: 'Bà ngoại có khuôn mặt phúc hậu và nụ cười hiền hậu làm em luôn thấy bình yên.',
  },
  {
    id: 'v-pe-2',
    word: 'rạng rỡ',
    pillar: 'people',
    category: 'Từ láy',
    meaning: 'Tươi sáng, tràn đầy niềm vui và sự tự tin trên gương mặt.',
    example: 'Mỗi khi em làm xong bài toán khó, nụ cười của cô giáo lại rạng rỡ như nắng xuân.',
  },
  {
    id: 'v-pe-3',
    word: 'ấm áp như ánh nắng đầu đông',
    pillar: 'people',
    category: 'So sánh',
    meaning: 'Tả giọng nói, ánh mắt hoặc bàn tay mang lại sự che chở yêu thương.',
    example: 'Bàn tay gầy gầy của bà nắm lấy tay em, ấm áp như ánh nắng đầu đông.',
  },
  {
    id: 'v-pe-4',
    word: 'thoăn thoắt',
    pillar: 'people',
    category: 'Từ láy',
    meaning: 'Động tác tay chân nhanh nhẹn, khéo léo và rất thành thạo.',
    example: 'Đôi bàn tay mẹ thoăn thoắt nhặt rau, chỉ loáng một cái bữa cơm tối đã thơm lừng.',
  },
  {
    id: 'v-pe-5',
    word: 'lấp lánh niềm vui',
    pillar: 'people',
    category: 'Màu sắc & Ánh sáng',
    meaning: 'Tả ánh mắt sáng lên khi nhân vật hạnh phúc hay tự hào.',
    example: 'Đôi mắt đen láy của bạn Lan luôn lấp lánh niềm vui mỗi giờ sinh hoạt lớp.',
  },
  {
    id: 'v-pe-6',
    word: 'thời gian khẽ gửi những sợi bạc',
    pillar: 'people',
    category: 'Nhân hóa',
    meaning: 'Cách nói tinh tế, giàu tình cảm khi tả mái tóc điểm bạc của ông bà, cha mẹ.',
    example: 'Trên mái tóc búi gọn của bà, thời gian khẽ gửi những sợi bạc lấp lánh sương mai.',
  },
  {
    id: 'v-pe-7',
    word: 'như dòng suối mát ngân vang',
    pillar: 'people',
    category: 'So sánh',
    meaning: 'Tả giọng đọc hoặc giọng giảng bài truyền cảm, trong trẻo.',
    example: 'Giọng cô giáo đọc thơ trầm bổng, trong trẻo như dòng suối mát ngân vang.',
  },
  {
    id: 'v-pe-8',
    word: 'tần tảo',
    pillar: 'people',
    category: 'Từ láy',
    meaning: 'Chịu khó, chăm chỉ làm lụng sớm hôm vì gia đình.',
    example: 'Dáng mẹ gầy gầy nhưng lúc nào cũng tần tảo chăm lo từng bữa ăn giấc ngủ cho em.',
  },
  {
    id: 'v-pe-9',
    word: 'nhẹ nhàng',
    pillar: 'people',
    category: 'Từ láy',
    meaning: 'Cử chỉ, lời nói êm ái, ân cần và dịu dàng.',
    example: 'Thầy nhẹ nhàng đặt tay lên vai em, khẽ bảo: "Cứ bình tĩnh viết lại từng dòng nhé!"',
  },
];

export const RESCUE_GAME_QUESTIONS: QuizQuestion[] = [
  {
    id: 'rq-1',
    game: 'rescue',
    pillar: 'plants',
    prompt: 'Chọn từ láy giàu sức sống nhất để tả những chồi non mới nhú sau cơn mưa xuân:',
    sentenceWithBlank: 'Sau cơn mưa xuân, những búp bàng non xanh ____ thi nhau hé mở đón nắng.',
    options: [
      {
        id: 'a',
        text: 'mơn mởn',
        isCorrect: true,
        feedback: 'Chính xác! "Mơn mởn" gợi vẻ tươi non, đầy sức sống của chồi lá mới nhú.',
      },
      {
        id: 'b',
        text: 'xù xì',
        isCorrect: false,
        feedback: '"Xù xì" dùng để tả bề mặt thô ráp như vỏ thân cây già, chưa hợp với búp lá non đâu Bạn nhỏ ơi!',
      },
      {
        id: 'c',
        text: 'lặng lẽ',
        isCorrect: false,
        feedback: '"Lặng lẽ" tả trạng thái yên tĩnh, chưa làm nổi bật sắc xanh tươi non của búp bàng.',
      },
    ],
    literaryNote: 'Từ láy "mơn mởn" rất đắt giá trong bài Tả cây cối vào mùa xuân.',
  },
  {
    id: 'rq-2',
    game: 'rescue',
    pillar: 'scenery',
    prompt: 'Chọn từ gợi tả âm thanh tự nhiên nhất của những giọt mưa đầu mùa:',
    sentenceWithBlank: 'Những hạt mưa đầu tiên rơi ____ trên tàu lá chuối sau vườn.',
    options: [
      {
        id: 'a',
        text: 'tí tách',
        isCorrect: true,
        feedback: 'Tuyệt vời! "Tí tách" mô phỏng chính xác âm thanh từng hạt mưa rơi thưa và nhẹ ban đầu.',
      },
      {
        id: 'b',
        text: 'ríu rít',
        isCorrect: false,
        feedback: '"Ríu rít" là tiếng chim hót hoặc tiếng trẻ em trò chuyện vui vẻ, không phải tiếng mưa rơi nhé!',
      },
      {
        id: 'c',
        text: 'rực rỡ',
        isCorrect: false,
        feedback: '"Rực rỡ" là tính từ chỉ màu sắc tươi sáng, không dùng để tả âm thanh giọt mưa.',
      },
    ],
    literaryNote: 'Từ láy tượng thanh như "tí tách", "rào rào" giúp bài Tả cảnh sống động như có âm thanh thật.',
  },
  {
    id: 'rq-3',
    game: 'rescue',
    pillar: 'people',
    prompt: 'Chọn từ láy thể hiện đôi tay làm việc nhanh nhẹn, khéo léo của mẹ:',
    sentenceWithBlank: 'Đôi bàn tay mẹ ____ gói từng chiếc bánh chưng vuông vắn.',
    options: [
      {
        id: 'a',
        text: 'lững lờ',
        isCorrect: false,
        feedback: '"Lững lờ" nghĩa là trôi rất chậm rãi (như mây, dòng nước), trái ngược với sự nhanh nhẹn.',
      },
      {
        id: 'b',
        text: 'thoăn thoắt',
        isCorrect: true,
        feedback: 'Xuất sắc! "Thoăn thoắt" vừa tả tốc độ nhanh vừa gợi sự khéo léo, thành thạo của đôi tay mẹ.',
      },
      {
        id: 'c',
        text: 'rộn rã',
        isCorrect: false,
        feedback: '"Rộn rã" dùng để tả âm thanh vui tươi, chưa miêu tả được động tác đôi tay.',
      },
    ],
    literaryNote: 'Khi Tả người đang làm việc, các từ láy như "thoăn thoắt", "tỉ mỉ" làm nhân vật sống động hẳn lên!',
  },
  {
    id: 'rq-4',
    game: 'rescue',
    pillar: 'scenery',
    prompt: 'Chọn cụm từ chỉ màu sắc đẹp nhất để tả cánh đồng lúa chín buổi sáng:',
    sentenceWithBlank: 'Dưới ánh mặt trời buổi sớm, cả cánh đồng lúa chín trải dài ____ như tấm thảm khổng lồ.',
    options: [
      {
        id: 'a',
        text: 'vàng óng ả',
        isCorrect: true,
        feedback: 'Quá hay! "Vàng óng ả" gợi sắc vàng rực rỡ, bóng mượt và tràn đầy sức sống của lúa chín.',
      },
      {
        id: 'b',
        text: 'vàng úa',
        isCorrect: false,
        feedback: '"Vàng úa" gợi cảm giác héo tàn, buồn bã — thường dùng cho lá rụng hơn là lúa chín bội thu.',
      },
      {
        id: 'c',
        text: 'rất vàng',
        isCorrect: false,
        feedback: '"Rất vàng" đúng nghĩa nhưng hơi đơn giản. Hãy dùng "vàng óng ả" để câu văn lung linh hơn nhé!',
      },
    ],
    literaryNote: 'Thay vì "rất + tính từ", học sinh lớp 5 hãy dùng tính từ gợi sắc độ như "vàng óng ả", "đỏ thắm", "xanh biếc".',
  },
  {
    id: 'rq-5',
    game: 'rescue',
    pillar: 'storytelling',
    prompt: 'Chọn từ láy tả bước chân thật nhẹ để tạo cảm giác bí mật trong truyện:',
    sentenceWithBlank: 'Chú sóc nhỏ ____ bước ra khỏi hốc cây, nghiêng đôi tai nghe ngóng.',
    options: [
      {
        id: 'a',
        text: 'rầm rập',
        isCorrect: false,
        feedback: '"Rầm rập" là tiếng bước chân rất mạnh và đông người, không hợp với chú sóc nhỏ bé.',
      },
      {
        id: 'b',
        text: 'rón rén',
        isCorrect: true,
        feedback: 'Chuẩn không cần chỉnh! "Rón rén" gợi rõ vẻ cẩn thận, khẽ khàng và tò mò của chú sóc.',
      },
      {
        id: 'c',
        text: 'xum xuê',
        isCorrect: false,
        feedback: '"Xum xuê" chỉ dùng để tả tán lá cây rậm rạp thôi Bạn nhỏ nhé!',
      },
    ],
    literaryNote: 'Từ láy gợi hình giúp người đọc nhìn thấy ngay dáng vẻ nhân vật trong bài Kể chuyện.',
  },
  {
    id: 'rq-6',
    game: 'rescue',
    pillar: 'plants',
    prompt: 'Chọn tính từ giàu hình ảnh để nâng cấp câu "Hoa hồng có màu đỏ":',
    sentenceWithBlank: 'Những đóa hồng nhung ____ vẫn còn đọng vài giọt sương mai long lanh.',
    options: [
      {
        id: 'a',
        text: 'đỏ thắm',
        isCorrect: true,
        feedback: 'Tuyệt đỉnh! "Đỏ thắm" diễn tả màu đỏ đậm đà, tươi tắn và mượt mà như nhung.',
      },
      {
        id: 'b',
        text: 'đỏ ghê',
        isCorrect: false,
        feedback: '"Đỏ ghê" là cách nói chuyện hằng ngày, chưa trang trọng và giàu hình ảnh trong văn miêu tả.',
      },
      {
        id: 'c',
        text: 'trong vắt',
        isCorrect: false,
        feedback: '"Trong vắt" dùng để tả bầu trời hoặc nước suối trong suốt, không tả màu hoa hồng.',
      },
    ],
    literaryNote: 'Chọn đúng sắc độ màu sắc giúp bức tranh ngôn từ của Sĩ tử nhí đẹp như tranh vẽ.',
  },
];

export const RACE_GAME_QUESTIONS: QuizQuestion[] = [
  {
    id: 'rc-1',
    game: 'race',
    pillar: 'plants',
    prompt: 'Biến câu "Cây phượng có tán lá rất rộng" thành câu có phép So sánh thật hay:',
    sentenceWithBlank: 'Cây phượng già đứng giữa sân trường, xòe tán lá xanh rì ____.',
    options: [
      {
        id: 'a',
        text: 'như một chiếc ô khổng lồ che mát cho chúng em',
        isCorrect: true,
        feedback: 'Xuất sắc! So sánh tán phượng với "chiếc ô khổng lồ" vừa đúng hình dáng vừa gợi sự che chở thân thương.',
      },
      {
        id: 'b',
        text: 'rất to và có rất nhiều lá xanh',
        isCorrect: false,
        feedback: 'Phương án này chưa có hình ảnh so sánh, lại bị lặp từ "rất" đấy Bạn nhỏ ơi!',
      },
      {
        id: 'c',
        text: 'như một cái bàn học bằng gỗ',
        isCorrect: false,
        feedback: 'Cái bàn gỗ phẳng và cứng, chưa gợi được dáng vòm mềm mại và bóng mát của tán cây.',
      },
    ],
    literaryNote: 'Phép So sánh hay cần chọn hai sự vật có nét tương đồng về hình dáng hoặc công dụng.',
  },
  {
    id: 'rc-2',
    game: 'race',
    pillar: 'scenery',
    prompt: 'Chọn hình ảnh Nhân hóa tinh tế nhất cho cảnh mặt trời buổi sáng:',
    sentenceWithBlank: 'Sáng sớm, ông mặt trời ____ trên rặng tre làng.',
    options: [
      {
        id: 'a',
        text: 'từ từ thức dậy, vén màn mây hồng mỉm cười nhìn xuống cánh đồng',
        isCorrect: true,
        feedback: 'Quá tuyệt vời! Gọi là "ông mặt trời" biết "thức dậy, vén màn mây, mỉm cười" là phép Nhân hóa cực kỳ sống động!',
      },
      {
        id: 'b',
        text: 'mọc lên ở hướng Đông vào lúc sáu giờ sáng',
        isCorrect: false,
        feedback: 'Câu này đúng sự thật nhưng mang tính kể thông tin, chưa dùng phép Nhân hóa để cảnh vật có hồn.',
      },
      {
        id: 'c',
        text: 'chiếu ánh nắng nóng xuống mặt đất',
        isCorrect: false,
        feedback: 'Cách viết này còn đơn giản và chưa gọi vật bằng hành động, cảm xúc của con người.',
      },
    ],
    literaryNote: 'Nhân hóa là khoác cho thiên nhiên những hành động, tình cảm thân thuộc của con người.',
  },
  {
    id: 'rc-3',
    game: 'race',
    pillar: 'people',
    prompt: 'Chọn câu có phép So sánh ấm áp nhất khi tả giọng nói của cô giáo:',
    sentenceWithBlank: 'Mỗi giờ tập đọc, giọng cô giáo cất lên trầm bổng ____.',
    options: [
      {
        id: 'a',
        text: 'rất to và rõ ràng để cả lớp cùng nghe',
        isCorrect: false,
        feedback: 'Câu này tả rõ ràng nhưng chưa sử dụng phép So sánh.',
      },
      {
        id: 'b',
        text: 'như dòng suối mát trong lành chảy qua khu rừng cổ tích',
        isCorrect: true,
        feedback: 'Một câu văn tuyệt đẹp! Hình ảnh "dòng suối mát" gợi cảm giác dịu êm, cuốn hút của giọng đọc cô giáo.',
      },
      {
        id: 'c',
        text: 'như tiếng trống trường giờ ra chơi',
        isCorrect: false,
        feedback: 'Tiếng trống trường rộn ràng dồn dập, không hợp với vẻ trầm bổng, dịu dàng của giọng đọc thơ.',
      },
    ],
    literaryNote: 'So sánh âm thanh với hình ảnh thiên nhiên dịu dàng giúp bài Tả người đầy cảm xúc.',
  },
  {
    id: 'rc-4',
    game: 'race',
    pillar: 'scenery',
    prompt: 'Xác định câu văn nào dưới đây sử dụng phép Nhân hóa:',
    sentenceWithBlank: 'Hãy chọn câu văn có hình ảnh thiên nhiên biết trò chuyện hoặc vui đùa như con người:',
    options: [
      {
        id: 'a',
        text: 'Dòng sông quê em uốn lượn như một dải lụa mềm.',
        isCorrect: false,
        feedback: 'Câu này dùng phép So sánh (có từ "như": dòng sông – dải lụa mềm) chứ chưa phải Nhân hóa nhé!',
      },
      {
        id: 'b',
        text: 'Những ngọn gió tinh nghịch rủ nhau chạy đuổi trên thảm lúa vàng.',
        isCorrect: true,
        feedback: 'Chuẩn xác 100%! Gió được tả là "tinh nghịch", biết "rủ nhau chạy đuổi" giống hệt các bạn nhỏ.',
      },
      {
        id: 'c',
        text: 'Buổi chiều, bầu trời có rất nhiều mây trắng.',
        isCorrect: false,
        feedback: 'Đây là câu kể thông thường, chưa sử dụng biện pháp tu từ.',
      },
    ],
    literaryNote: 'Phân biệt nhanh: So sánh thường có "như, tựa, giống"; Nhân hóa cho sự vật cử chỉ, tâm trạng của người.',
  },
  {
    id: 'rc-5',
    game: 'race',
    pillar: 'plants',
    prompt: 'Nâng cấp câu "Cây hoa hồng có nhiều giọt sương" bằng phép So sánh kết hợp Nhân hóa:',
    sentenceWithBlank: 'Sáng sớm, đóa hồng nhung khoe sắc đỏ thắm, ____.',
    options: [
      {
        id: 'a',
        text: 'đính trên cánh hoa mềm những hạt sương long lanh như viên ngọc bé xíu',
        isCorrect: true,
        feedback: 'Tuyệt vời! Bạn nhỏ đã kết hợp cả cảm giác mềm mại lẫn phép So sánh hạt sương như viên ngọc!',
      },
      {
        id: 'b',
        text: 'trên lá có nước đọng lại từ đêm hôm qua',
        isCorrect: false,
        feedback: 'Câu này kể lại rất thật nhưng chưa tạo được vẻ đẹp lung linh, giàu chất thơ.',
      },
      {
        id: 'c',
        text: 'hoa màu đỏ và có gai ở thân cây',
        isCorrect: false,
        feedback: 'Câu này mới liệt kê đặc điểm cơ bản, chưa có phép So sánh hay Nhân hóa.',
      },
    ],
    literaryNote: 'Kết hợp màu sắc + từ láy ("long lanh") + So sánh ("như viên ngọc") là công thức viết văn điểm 10!',
  },
];

export const STORY_THEME_IDEAS = [
  'Cánh diều sáo bay qua cánh đồng chiều',
  'Chú mèo mướp đi tìm chiếc chuông nhỏ',
  'Đóng vai Cây Khế kể chuyện cổ tích',
  'Cuộc trò chuyện của Chiếc Cặp Sách và Hộp Bút',
  'Hạt mưa nhỏ lần đầu ghé thăm khu vườn',
  'Kỳ nghỉ hè kỳ diệu ở nhà bà ngoại',
];

export const STORY_ADVENTURES: StoryAdventure[] = [
  {
    id: 'story-boat',
    title: 'Chuyến phiêu lưu của Thuyền Giấy Đèn Lồng',
    theme: 'Tình bạn & Điều ước mùa hè',
    storytellingStyle: 'add_details',
    narratorRole: 'Cách 1: Thêm chi tiết sáng tạo',
    steps: [
      {
        stage: 'Chặng 1: Mở đầu lôi cuốn',
        question: 'Bạn nhỏ muốn mở đầu câu chuyện của chiếc thuyền giấy như thế nào?',
        choices: [
          {
            id: 's1-a',
            label: 'Dùng phép Nhân hóa đầy phép màu',
            snippet:
              'Chiều hôm ấy, khi hoàng hôn nhuộm hồng con suối nhỏ sau vườn, chiếc thuyền giấy hoa cúc khẽ rung mình thức giấc, háo hức mang trên lưng chiếc đèn lồng bé xíu lên đường tìm biển lớn.',
            deviceTag: 'Nhân hóa',
          },
          {
            id: 's1-b',
            label: 'Dùng phép So sánh êm đềm',
            snippet:
              'Dòng suối quê em uốn lượn như dải lụa bạc giữa hai bờ dương xỉ xanh rì. Trên làn nước trong vắt ấy, chiếc thuyền giấy do chính tay em gấp nhẹ nhàng lướt đi mang theo một điều ước mùa hè.',
            deviceTag: 'So sánh',
          },
        ],
      },
      {
        stage: 'Chặng 2: Thắt nút bất ngờ',
        question: 'Trên đường trôi, một thử thách bất ngờ ập đến! Chuyện gì xảy ra?',
        choices: [
          {
            id: 's2-a',
            label: 'Cơn gió tinh nghịch và khúc quanh xoáy nước',
            snippet:
              'Bỗng một cơn gió tinh nghịch ào tới, thổi nghiêng ngọn lửa nhỏ khiến chiếc thuyền chao đảo bên đám lá sen rậm rạp. Đàn đom đóm thấy vậy liền vội vàng bay tới, thắp sáng cả một khoảng trời như ngàn vì sao lạc xuống dòng suối.',
            deviceTag: 'So sánh + Nhân hóa',
          },
          {
            id: 's2-b',
            label: 'Cuộc gặp gỡ với chú ếch xanh nhút nhát',
            snippet:
              'Đến khúc quanh hẹp, thuyền giấy vướng vào một cành cây khô và đứng khựng lại. Từ dưới đám cỏ, một chú ếch xanh rón rén nhảy lên lá sen, ngơ ngác nhìn ánh đèn vàng ấm áp rồi nhanh nhẹn dùng chiếc que nhỏ đẩy giúp thuyền thoát nạn.',
            deviceTag: 'Từ láy + Đối thoại hành động',
          },
        ],
      },
      {
        stage: 'Chặng 3: Mở nút ấm áp',
        question: 'Câu chuyện khép lại bằng một cái kết thật giàu cảm xúc:',
        choices: [
          {
            id: 's3-a',
            label: 'Bài học về lòng tốt và sự sẻ chia',
            snippet:
              'Nhờ những người bạn nhỏ tốt bụng ven bờ, chiếc thuyền giấy lại kiêu hãnh rẽ sóng tiến về phía trước. Ánh sáng ấm áp của chiếc đèn lồng như lời cảm ơn dịu dàng gửi lại khu rừng đêm đầy kỷ niệm.',
            deviceTag: 'Cảm xúc sâu lắng',
          },
          {
            id: 's3-b',
            label: 'Lời hứa cho những ước mơ tuổi thơ',
            snippet:
              'Thuyền giấy dần khuất sau rặng tre xanh, nhưng tiếng suối róc rách vẫn như thầm thì kể lại hành trình dũng cảm ấy. Em mỉm cười nhận ra: chỉ cần giữ lòng dũng cảm, ước mơ nào cũng sẽ tìm thấy bến bờ tươi đẹp.',
            deviceTag: 'Mở rộng ý nghĩa',
          },
        ],
      },
    ],
  },
  {
    id: 'story-chalk',
    title: 'Lời tự sự của Viên Phấn Trắng Út',
    theme: 'Mái trường & Lòng biết ơn thầy cô',
    storytellingStyle: 'roleplay',
    narratorRole: 'Cách 2: Đóng vai Viên Phấn Trắng',
    steps: [
      {
        stage: 'Chặng 1: Mở đầu lôi cuốn',
        question: 'Trong vai Viên Phấn Trắng út (xưng "tôi"), Bạn nhỏ muốn tự giới thiệu ra sao?',
        choices: [
          {
            id: 'c1-a',
            label: 'Tự sự háo hức chờ tiếng trống vào lớp',
            snippet:
              'Tôi là viên phấn trắng bé út nằm gọn trong chiếc hộp gỗ trên bàn giáo viên lớp 5A. Sáng nào cũng vậy, tim tôi lại hồi hộp mong chờ tiếng trống tùng tùng để được nhảy múa trên tấm bảng xanh mướt.',
            deviceTag: 'Đóng vai + Từ láy',
          },
          {
            id: 'c1-b',
            label: 'Cảm nhận ánh nắng sớm trên bục giảng',
            snippet:
              'Nắng sớm len qua khung cửa sổ chiếu lấp lánh lên chiếc áo trắng tinh khôi của tôi. Nằm trên bục giảng, tôi tự thấy mình tròn trịa như một chiếc đũa thần nhỏ đang sẵn sàng viết nên bao điều kỳ diệu.',
            deviceTag: 'Đóng vai + So sánh',
          },
        ],
      },
      {
        stage: 'Chặng 2: Thắt nút bất ngờ',
        question: 'Viên phấn gặp phải nỗi băn khoăn nào giữa buổi học?',
        choices: [
          {
            id: 'c2-a',
            label: 'Nỗi sợ bị ngắn đi sau mỗi bài giảng',
            snippet:
              'Sau mấy tiết Tập làm văn, tôi cúi nhìn thân mình ngắn đi một khúc mà buồn thiu: "Cứ viết mãi thế này, chẳng bao lâu nữa mình sẽ tan biến mất thôi!" Bác Bảng Xanh nghe thấy liền khẽ vỗ về, chỉ xuống những ánh mắt sáng rỡ của lũ học trò đang say sưa ghi chép.',
            deviceTag: 'Lời thoại nhân hóa',
          },
          {
            id: 'c2-b',
            label: 'Cơn mưa bất chợt và nét chữ ấm áp của cô',
            snippet:
              'Chiều hôm ấy mưa rào rơi tí tách ngoài hiên khiến vài bạn nhỏ gà gật buồn ngủ. Bàn tay dịu dàng của cô giáo nâng tôi lên, thoăn thoắt vẽ một sơ đồ hình cây nở hoa thật đẹp khiến tôi thấy mình bừng sáng niềm vui còn cả lớp thì ồ lên thích thú.',
            deviceTag: 'Từ láy gợi thanh & hình',
          },
        ],
      },
      {
        stage: 'Chặng 3: Mở nút ấm áp',
        question: 'Trong vai Viên Phấn, câu chuyện khép lại bằng cảm xúc nào?',
        choices: [
          {
            id: 'c3-a',
            label: 'Niềm hạnh phúc khi được cho đi',
            snippet:
              'Lòng tôi bỗng ấm áp lạ thường. Dù thân mình có ngắn đi từng ngày, nhưng những dòng chữ trắng tinh khôi tôi để lại sẽ ở mãi trong tâm trí các bạn nhỏ như cánh diều nâng đỡ ước mơ bay cao.',
            deviceTag: 'So sánh giàu cảm xúc',
          },
          {
            id: 'c3-b',
            label: 'Tình cảm dành cho cô giáo lớp 5',
            snippet:
              'Vài hạt bụi trắng của tôi khẽ vương trên mái tóc cô giáo, lấp lánh như sương mai. Tôi mỉm cười mãn nguyện vì được làm người bạn nhỏ đồng hành cùng sự tận tụy và tình yêu thương lặng thầm của cô.',
            deviceTag: 'Hình ảnh đọng lại',
          },
        ],
      },
    ],
  },
  {
    id: 'story-starfruit',
    title: 'Khu vườn bí mật của Cây Khế Già',
    theme: 'Cổ tích kể lại · Lòng nhân hậu',
    storytellingStyle: 'roleplay',
    narratorRole: 'Cách 2: Đóng vai Cây Khế Già',
    steps: [
      {
        stage: 'Chặng 1: Mở đầu lôi cuốn',
        question: 'Đóng vai Cây Khế trong vườn nhà người em (xưng "tôi"), Bạn nhỏ mở lời thế nào?',
        choices: [
          {
            id: 'k1-a',
            label: 'Tự hào về tán lá xum xuê và chùm quả vàng',
            snippet:
              'Tôi là cây khế già đứng nép bên mái nhà tranh đơn sơ của người em hiền lành. Nhờ bàn tay anh sớm tối tưới tắm, tán lá của tôi xanh mơn mởn còn từng chùm quả chín vàng óng ả như những ngôi sao năm cánh treo đầy cành.',
            deviceTag: 'Đóng vai + So sánh',
          },
          {
            id: 'k1-b',
            label: 'Cảm nhận tình thương ấm áp trong khu vườn nhỏ',
            snippet:
              'Cả khu vườn bé nhỏ này chỉ có tôi làm bạn cùng hai vợ chồng người em tần tảo. Mỗi sáng nắng lên, tôi lại vươn những cành lá xum xuê rì rào đón gió như muốn hát lời cảm ơn chủ nhân tốt bụng.',
            deviceTag: 'Đóng vai + Nhân hóa',
          },
        ],
      },
      {
        stage: 'Chặng 2: Thắt nút bất ngờ',
        question: 'Một buổi sáng, vị khách kỳ lạ sà xuống tán lá của tôi! Chuyện gì xảy ra?',
        choices: [
          {
            id: 'k2-a',
            label: 'Chú chim lớn lông óng ánh ghé thăm',
            snippet:
              'Bỗng một hôm, có tiếng vỗ cánh phành phạch vang khắp khoảng trời rồi một chú chim khổng lồ bộ lông rực rỡ đáp xuống cành tôi mổ lấy mổ để những quả khế ngọt nhất. Tôi lo lắng run rẩy cành lá, còn người em chỉ nhẹ nhàng ngước lên thở dài mà không hề xua đuổi.',
            deviceTag: 'Từ láy + Chi tiết sáng tạo',
          },
          {
            id: 'k2-b',
            label: 'Lời hứa kỳ diệu vang lên giữa nắng mai',
            snippet:
              'Thấy từng chùm quả chín vàng vơi dần, tôi xót xa thay cho người chủ nghèo. Thế nhưng nghe giọng than hiền hậu của anh, chú chim lạ bỗng ngừng mổ, nghiêng đôi mắt sáng trong cất tiếng vang vang: "Ăn một quả, trả cục vàng, may túi ba gang, mang đi mà đựng!"',
            deviceTag: 'Lời thoại + Bất ngờ',
          },
        ],
      },
      {
        stage: 'Chặng 3: Mở nút ấm áp',
        question: 'Cây Khế khép lại câu chuyện cổ tích bằng suy nghĩ sâu sắc nào?',
        choices: [
          {
            id: 'k3-a',
            label: 'Niềm vui khi chủ nhân giữ trọn tấm lòng thật thà',
            snippet:
              'Người em chỉ may đúng chiếc túi ba gang nhỏ nhắn theo lời dặn. Từ ngày ấy, mái nhà tranh trở nên ấm no rộn rã tiếng cười, còn tôi vẫn rung rinh trong nắng sớm, thầm nhắc mọi người rằng lòng nhân hậu luôn nở hoa kết trái ngọt lành.',
            deviceTag: 'Bài học sâu sắc',
          },
          {
            id: 'k3-b',
            label: 'Hình ảnh khu vườn mãi ngát hương',
            snippet:
              'Dù cuộc sống đã đủ đầy, người em vẫn chẳng quên mỗi chiều ra gốc cây trò chuyện và tưới nước cho tôi. Gió chiều thổi qua kẽ lá xào xạc, gửi đi câu chuyện đẹp về sự thật thà bay xa khắp xóm làng.',
            deviceTag: 'Kết mở giàu hình ảnh',
          },
        ],
      },
    ],
  },
];

export const RANKS = [
  { minXp: 0, title: 'Người Gieo Hạt Chữ', nextXp: 60 },
  { minXp: 60, title: 'Thợ Săn Từ Hay', nextXp: 150 },
  { minXp: 150, title: 'Phù Thủy Câu Văn', nextXp: 280 },
  { minXp: 280, title: 'Nhà Văn Nhí Lớp 5', nextXp: 450 },
  { minXp: 450, title: 'Đại Sứ Ngôn Từ', nextXp: 700 },
];

export function getStudentRank(xp: number) {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) current = r;
  }
  const idx = RANKS.indexOf(current);
  const next = RANKS[idx + 1];
  const progress = next
    ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100;
  return {
    title: current.title,
    nextTitle: next ? next.title : 'Đỉnh cao Ngôn từ',
    xpToNext: next ? Math.max(0, next.minXp - xp) : 0,
    progress,
    levelNumber: idx + 1,
  };
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-seed',
    title: 'Mầm Non Ngôn Từ',
    description: 'Tích lũy 30 điểm kinh nghiệm đầu tiên trên hành trình viết văn.',
    rewardLabel: 'Quà ảo: Bút Máy Xanh Mint',
    check: (s) => ({ unlocked: s.xp >= 30, current: Math.min(s.xp, 30), target: 30 }),
  },
  {
    id: 'sentence-wizard',
    title: 'Phù Thủy Nâng Cấp',
    description: 'Sử dụng Xưởng Nâng cấp câu văn ít nhất 2 lần.',
    rewardLabel: 'Quà ảo: Lọ Mực Phép Màu',
    check: (s) => ({ unlocked: s.upgradesCount >= 2, current: Math.min(s.upgradesCount, 2), target: 2 }),
  },
  {
    id: 'word-doctor',
    title: 'Bác Sĩ Câu Chữ',
    description: 'Nhờ Trợ lý Ngôn Từ sửa lỗi & góp ý ít nhất 1 đoạn văn.',
    rewardLabel: 'Quà ảo: Kính Lúp Soi Chữ',
    check: (s) => ({ unlocked: s.checksCount >= 1, current: Math.min(s.checksCount, 1), target: 1 }),
  },
  {
    id: 'vocab-collector',
    title: 'Kho Báu Từ Biểu Cảm',
    description: 'Lưu ít nhất 5 từ vựng hay vào Sổ tay cá nhân.',
    rewardLabel: 'Quà ảo: Sổ Tay Bìa Hoa Phượng',
    check: (s) => ({ unlocked: s.savedVocabCount >= 5, current: Math.min(s.savedVocabCount, 5), target: 5 }),
  },
  {
    id: 'rescue-hero',
    title: 'Hiệp Sĩ Giải Cứu Tính Từ',
    description: 'Trả lời đúng ít nhất 4 câu trong thử thách Giải cứu Tính từ.',
    rewardLabel: 'Quà ảo: Huy Chương Ngôi Sao Vàng',
    check: (s) => ({ unlocked: s.rescueCorrectCount >= 4, current: Math.min(s.rescueCorrectCount, 4), target: 4 }),
  },
  {
    id: 'rhetoric-racer',
    title: 'Tay Đua So Sánh & Nhân Hóa',
    description: 'Trả lời đúng ít nhất 3 câu trong Cuộc đua So sánh & Nhân hóa.',
    rewardLabel: 'Quà ảo: Cúp Cánh Chim Xanh',
    check: (s) => ({ unlocked: s.raceCorrectCount >= 3, current: Math.min(s.raceCorrectCount, 3), target: 3 }),
  },
  {
    id: 'story-architect',
    title: 'Tác Giả Tí Hon',
    description: 'Hoàn thành 1 câu chuyện sáng tạo trong trò chơi Xếp gạch Cốt truyện.',
    rewardLabel: 'Quà ảo: Đèn Lồng Thuyền Giấy',
    check: (s) => ({ unlocked: s.storiesCompletedCount >= 1, current: Math.min(s.storiesCompletedCount, 1), target: 1 }),
  },
  {
    id: 'golden-notebook',
    title: 'Chủ Nhân Sổ Tay Vàng',
    description: 'Lưu giữ ít nhất 3 câu văn đẹp đã nâng cấp trong Sổ tay.',
    rewardLabel: 'Quà ảo: Dấu Sáp Hoa Hồng Nhung',
    check: (s) => ({
      unlocked: s.savedSentencesCount >= 3,
      current: Math.min(s.savedSentencesCount, 3),
      target: 3,
    }),
  },
];

export const ENCOURAGEMENT_MESSAGES = [
  'Một câu văn tuyệt vời! Kho tàng ngôn từ của Bạn nhỏ đang lớn dần đấy!',
  'Sĩ tử nhí đang sở hữu vốn từ thật phong phú!',
  'Cố lên nhé Bạn nhỏ, mỗi từ hay hôm nay là một viên ngọc cho bài văn ngày mai!',
  'Trợ lý Ngôn Từ rất tự hào về sự chăm chỉ và óc quan sát tinh tế của Bạn nhỏ!',
];
