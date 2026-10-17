package com.chemlab.config;

import com.chemlab.entity.*;
import com.chemlab.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

  private final MoleculeRepository moleculeRepository;
  private final LessonRepository lessonRepository;
  private final QuestionRepository questionRepository;
  private final UserRepository userRepository;
  private final ReactionRepository reactionRepository;
  private final ClassRoomRepository classRoomRepository;
  private final ExamRepository examRepository;
  private final PasswordEncoder passwordEncoder;

  public DataSeeder(MoleculeRepository moleculeRepository, LessonRepository lessonRepository,
      QuestionRepository questionRepository, UserRepository userRepository,
      ReactionRepository reactionRepository, ClassRoomRepository classRoomRepository,
      ExamRepository examRepository,
      PasswordEncoder passwordEncoder) {
    this.moleculeRepository = moleculeRepository;
    this.lessonRepository = lessonRepository;
    this.questionRepository = questionRepository;
    this.userRepository = userRepository;
    this.reactionRepository = reactionRepository;
    this.classRoomRepository = classRoomRepository;
    this.examRepository = examRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(String... args) {
    if (moleculeRepository.count() > 0)
      return;

    // Seed demo user
    User admin = User.builder()
        .name("Admin")
        .email("admin@chemlab.com")
        .passwordHash(passwordEncoder.encode("admin123"))
        .role(User.Role.ADMIN)
        .build();
    userRepository.save(admin);

    User student = User.builder()
        .name("Demo Student")
        .email("student@chemlab.com")
        .passwordHash(passwordEncoder.encode("student123"))
        .role(User.Role.STUDENT)
        .build();
    userRepository.save(student);

    User teacher = User.builder()
        .name("Demo teacher")
        .email("teacher@chemlab.com")
        .passwordHash(passwordEncoder.encode("teacher123"))
        .role(User.Role.TEACHER)
        .build();
    userRepository.save(teacher);

    // Lop thu hai de minh hoa: giao vien chi xem duoc lop minh duoc phan cong
    User student2 = User.builder()
        .name("Demo Student 2")
        .email("student2@chemlab.com")
        .passwordHash(passwordEncoder.encode("student123"))
        .role(User.Role.STUDENT)
        .build();
    userRepository.save(student2);

    User teacher2 = User.builder()
        .name("Demo teacher 2")
        .email("teacher2@chemlab.com")
        .passwordHash(passwordEncoder.encode("teacher123"))
        .role(User.Role.TEACHER)
        .build();
    userRepository.save(teacher2);

    // Seed Molecules
    Molecule h2o = moleculeRepository.save(Molecule.builder()
        .name("Nước")
        .formula("H2O")
        .description("Nước là hợp chất vô cơ có cực. Phân tử có dạng góc với góc liên kết 104,5°.")
        .atomData("""
            {
              "atoms": [
                {"element": "O", "x": 0, "y": 0, "z": 0},
                {"element": "H", "x": 0.96, "y": 0, "z": 0},
                {"element": "H", "x": -0.24, "y": 0.93, "z": 0}
              ],
              "bonds": [
                {"from": 0, "to": 1, "order": 1},
                {"from": 0, "to": 2, "order": 1}
              ]
            }
            """)
        .build());

    Molecule nh3 = moleculeRepository.save(Molecule.builder()
        .name("Amoniac")
        .formula("NH3")
        .description("Amoniac là hợp chất của nitơ và hiđro, có dạng hình học chóp tam giác.")
        .atomData("""
            {
              "atoms": [
                {"element": "N", "x": 0, "y": 0.37, "z": 0},
                {"element": "H", "x": 0.94, "y": -0.12, "z": 0},
                {"element": "H", "x": -0.47, "y": -0.12, "z": 0.82},
                {"element": "H", "x": -0.47, "y": -0.12, "z": -0.82}
              ],
              "bonds": [
                {"from": 0, "to": 1, "order": 1},
                {"from": 0, "to": 2, "order": 1},
                {"from": 0, "to": 3, "order": 1}
              ]
            }
            """)
        .build());

    Molecule ch4 = moleculeRepository.save(Molecule.builder()
        .name("Metan")
        .formula("CH4")
        .description("Metan là phân tử dạng tứ diện đều và là ankan đơn giản nhất.")
        .atomData("""
            {
              "atoms": [
                {"element": "C", "x": 0, "y": 0, "z": 0},
                {"element": "H", "x": 0.63, "y": 0.63, "z": 0.63},
                {"element": "H", "x": -0.63, "y": -0.63, "z": 0.63},
                {"element": "H", "x": -0.63, "y": 0.63, "z": -0.63},
                {"element": "H", "x": 0.63, "y": -0.63, "z": -0.63}
              ],
              "bonds": [
                {"from": 0, "to": 1, "order": 1},
                {"from": 0, "to": 2, "order": 1},
                {"from": 0, "to": 3, "order": 1},
                {"from": 0, "to": 4, "order": 1}
              ]
            }
            """)
        .build());

    Molecule co2 = moleculeRepository.save(Molecule.builder()
        .name("Cacbon đioxit")
        .formula("CO2")
        .description(
            "Cacbon đioxit là phân tử dạng thẳng, gồm một nguyên tử cacbon liên kết đôi với hai nguyên tử oxi.")
        .atomData("""
            {
              "atoms": [
                {"element": "C", "x": 0, "y": 0, "z": 0},
                {"element": "O", "x": -1.16, "y": 0, "z": 0},
                {"element": "O", "x": 1.16, "y": 0, "z": 0}
              ],
              "bonds": [
                {"from": 0, "to": 1, "order": 2},
                {"from": 0, "to": 2, "order": 2}
              ]
            }
            """)
        .build());

    Molecule o2 = moleculeRepository.save(Molecule.builder()
        .name("Oxi")
        .formula("O2")
        .description("Oxi phân tử gồm hai nguyên tử oxi liên kết với nhau bằng một liên kết đôi.")
        .atomData("""
            {
              "atoms": [
                {"element": "O", "x": -0.6, "y": 0, "z": 0},
                {"element": "O", "x": 0.6, "y": 0, "z": 0}
              ],
              "bonds": [
                {"from": 0, "to": 1, "order": 2}
              ]
            }
            """)
        .build());

    Molecule n2 = moleculeRepository.save(Molecule.builder()
        .name("Nitơ")
        .formula("N2")
        .description(
            "Nitơ phân tử gồm hai nguyên tử liên kết bằng liên kết ba. Nitơ chiếm 78% thể tích khí quyển Trái Đất.")
        .atomData("""
            {
              "atoms": [
                {"element": "N", "x": -0.55, "y": 0, "z": 0},
                {"element": "N", "x": 0.55, "y": 0, "z": 0}
              ],
              "bonds": [
                {"from": 0, "to": 1, "order": 3}
              ]
            }
            """)
        .build());

    // Seed Lessons - noi dung tieng Viet, bam sat chuong trinh Hoa hoc THPT
    lessonRepository.save(Lesson.builder()
        .title("Cấu trúc phân tử nước (H₂O)")
        .topic("Hình học phân tử")
        .difficulty("EASY")
        .content(
            """
                <h2>Phân tử nước - H₂O</h2>
                <p>Nước là một trong những phân tử quan trọng nhất của hóa học và của sự sống. Mỗi phân tử nước gồm một nguyên tử oxi liên kết với hai nguyên tử hiđro bằng hai liên kết cộng hóa trị có cực.</p>

                <h3>1. Các đặc trưng cơ bản</h3>
                <ul>
                    <li><strong>Công thức phân tử:</strong> H₂O</li>
                    <li><strong>Khối lượng mol:</strong> 18 g/mol</li>
                    <li><strong>Dạng hình học:</strong> Góc (chữ V)</li>
                    <li><strong>Góc liên kết H–O–H:</strong> 104,5°</li>
                    <li><strong>Độ dài liên kết O–H:</strong> khoảng 0,096 nm</li>
                    <li><strong>Tính phân cực:</strong> Phân tử có cực</li>
                    <li><strong>Trạng thái lai hóa của oxi:</strong> sp³</li>
                </ul>

                <h3>2. Vì sao phân tử nước có dạng góc?</h3>
                <p>Nguyên tử oxi có 6 electron ở lớp ngoài cùng. Hai electron được dùng để tạo hai liên kết cộng hóa trị với hai nguyên tử hiđro, bốn electron còn lại tồn tại dưới dạng hai cặp electron không liên kết (còn gọi là cặp electron tự do hay cặp electron riêng).</p>
                <p>Hai cặp electron không liên kết này chiếm nhiều không gian hơn các cặp electron liên kết, đồng thời đẩy hai liên kết O–H lại gần nhau. Kết quả là góc liên kết bị thu hẹp từ 109,5° (góc của hình tứ diện đều lý tưởng) xuống còn 104,5°, tạo nên dạng hình học góc đặc trưng của nước.</p>

                <h3>3. Áp dụng thuyết VSEPR</h3>
                <p>Thuyết VSEPR (thuyết đẩy giữa các cặp electron ở lớp vỏ hóa trị) cho rằng các cặp electron quanh nguyên tử trung tâm sẽ sắp xếp sao cho lực đẩy giữa chúng nhỏ nhất.</p>
                <p>Với phân tử nước, quanh nguyên tử oxi có tổng cộng 4 nhóm electron gồm 2 cặp liên kết và 2 cặp không liên kết. Do đó:</p>
                <ul>
                    <li><strong>Hình học electron:</strong> Tứ diện</li>
                    <li><strong>Hình học phân tử:</strong> Góc (vì hai cặp electron không liên kết không được tính vào hình dạng nhìn thấy của phân tử)</li>
                </ul>
                <p>Thứ tự lực đẩy giảm dần: cặp tự do – cặp tự do &gt; cặp tự do – cặp liên kết &gt; cặp liên kết – cặp liên kết. Chính thứ tự này giải thích vì sao góc liên kết luôn nhỏ hơn giá trị lý tưởng khi phân tử có cặp electron tự do.</p>

                <h3>4. Tính phân cực và liên kết hiđro</h3>
                <p>Oxi có độ âm điện 3,44 còn hiđro chỉ 2,20. Hiệu độ âm điện lớn khiến cặp electron liên kết bị hút lệch về phía oxi, làm oxi mang một phần điện tích âm (δ⁻) và mỗi hiđro mang một phần điện tích dương (δ⁺).</p>
                <p>Vì phân tử có dạng góc chứ không đối xứng thẳng, các momen lưỡng cực của hai liên kết O–H không triệt tiêu nhau mà cộng lại thành một momen lưỡng cực tổng khá lớn (khoảng 1,85 D). Đây là lý do nước là một phân tử có cực mạnh.</p>
                <p>Nhờ tính phân cực này, các phân tử nước tạo được <strong>liên kết hiđro</strong> với nhau: nguyên tử hiđro của phân tử này bị hút về nguyên tử oxi của phân tử bên cạnh.</p>

                <h3>5. Liên kết hiđro giải thích các tính chất đặc biệt của nước</h3>
                <ul>
                    <li><strong>Nhiệt độ sôi cao bất thường:</strong> nước sôi ở 100°C trong khi H₂S có khối lượng phân tử lớn hơn lại sôi ở −60°C. Nguyên nhân là phải cung cấp thêm năng lượng để phá vỡ mạng liên kết hiđro.</li>
                    <li><strong>Nước đá nhẹ hơn nước lỏng:</strong> khi đóng băng, liên kết hiđro sắp xếp các phân tử thành mạng lục giác rỗng, làm thể tích tăng và khối lượng riêng giảm. Nhờ vậy băng nổi trên mặt nước.</li>
                    <li><strong>Sức căng bề mặt lớn:</strong> giúp một số loài côn trùng có thể đứng trên mặt nước.</li>
                    <li><strong>Dung môi tốt cho chất có cực:</strong> nước hòa tan được muối ăn, đường, axit vì các đầu tích điện của phân tử nước bao quanh và tách rời các ion hoặc phân tử chất tan.</li>
                </ul>

                <h3>6. Ghi nhớ</h3>
                <p>Chỉ từ một chi tiết nhỏ là hai cặp electron tự do trên nguyên tử oxi, ta suy ra được cả một chuỗi hệ quả: dạng góc → phân cực → liên kết hiđro → nhiệt độ sôi cao, băng nổi, dung môi tốt. Đây là ví dụ tiêu biểu cho nguyên tắc <em>cấu trúc quyết định tính chất</em> trong hóa học.</p>
                """)
        .molecule(h2o)
        .build());

    lessonRepository.save(Lesson.builder()
        .title("Cấu trúc phân tử amoniac (NH₃)")
        .topic("Hình học phân tử")
        .difficulty("EASY")
        .content(
            """
                <h2>Phân tử amoniac - NH₃</h2>
                <p>Amoniac gồm một nguyên tử nitơ liên kết với ba nguyên tử hiđro, trên nitơ còn lại một cặp electron không liên kết. Đây là hợp chất công nghiệp quan trọng, là nguyên liệu chính để sản xuất phân bón và axit nitric.</p>

                <h3>1. Các đặc trưng cơ bản</h3>
                <ul>
                    <li><strong>Công thức phân tử:</strong> NH₃</li>
                    <li><strong>Khối lượng mol:</strong> 17 g/mol</li>
                    <li><strong>Dạng hình học:</strong> Chóp tam giác (tháp tam giác)</li>
                    <li><strong>Góc liên kết H–N–H:</strong> 107°</li>
                    <li><strong>Tính phân cực:</strong> Phân tử có cực</li>
                    <li><strong>Trạng thái lai hóa của nitơ:</strong> sp³</li>
                </ul>

                <h3>2. Giải thích hình dạng phân tử</h3>
                <p>Nguyên tử nitơ có 5 electron ở lớp ngoài cùng. Ba electron tạo ba liên kết cộng hóa trị với ba nguyên tử hiđro, hai electron còn lại tạo thành một cặp electron không liên kết.</p>
                <p>Quanh nitơ có 4 nhóm electron (3 cặp liên kết và 1 cặp tự do) nên hình học electron là tứ diện. Tuy nhiên cặp electron tự do đẩy ba liên kết N–H xuống phía dưới, làm phân tử có dạng chóp tam giác với nitơ ở đỉnh và ba nguyên tử hiđro ở mặt đáy.</p>
                <p><strong>So sánh góc liên kết:</strong> CH₄ có 109,5° (không có cặp tự do), NH₃ có 107° (một cặp tự do), H₂O có 104,5° (hai cặp tự do). Càng nhiều cặp electron tự do thì góc liên kết càng bị thu hẹp. Đây là quy luật rất hay được hỏi trong đề thi.</p>

                <h3>3. Tính chất hóa học nổi bật</h3>
                <p><strong>Tính bazơ:</strong> Cặp electron tự do trên nitơ có thể nhận proton H⁺, vì vậy amoniac là một bazơ Bronsted:</p>
                <p>NH₃ + H₂O ⇌ NH₄⁺ + OH⁻</p>
                <p>Dung dịch amoniac làm quỳ tím hóa xanh và tác dụng với axit tạo muối amoni:</p>
                <p>NH₃ + HCl → NH₄Cl (khói trắng)</p>
                <p><strong>Khả năng tạo phức:</strong> Cũng nhờ cặp electron tự do, amoniac tạo được phức với nhiều ion kim loại chuyển tiếp, ví dụ ion phức tetraammin đồng có màu xanh lam đậm đặc trưng.</p>
                <p><strong>Tính khử:</strong> Nitơ trong NH₃ có số oxi hóa −3 là mức thấp nhất, nên amoniac có thể bị oxi hóa. Phản ứng oxi hóa amoniac có xúc tác platin là bước đầu của quá trình sản xuất axit nitric:</p>
                <p>4NH₃ + 5O₂ → 4NO + 6H₂O (xúc tác Pt, 850°C)</p>

                <h3>4. Tính chất vật lí và liên kết hiđro</h3>
                <p>Amoniac là chất khí không màu, mùi khai rất đặc trưng, nhẹ hơn không khí. Do phân tử có cực và tạo được liên kết hiđro, amoniac tan cực kỳ nhiều trong nước: ở 20°C một lít nước hòa tan được khoảng 700 lít khí NH₃.</p>
                <p>Nhiệt độ sôi của NH₃ là −33°C, cao hơn nhiều so với PH₃ (−88°C) dù PH₃ có khối lượng phân tử lớn hơn. Nguyên nhân vẫn là liên kết hiđro, do nitơ có độ âm điện đủ lớn còn photpho thì không.</p>

                <h3>5. Ứng dụng</h3>
                <ul>
                    <li>Sản xuất phân đạm: urê, amoni nitrat, amoni sunfat</li>
                    <li>Sản xuất axit nitric theo quá trình Ostwald</li>
                    <li>Làm chất tải lạnh trong hệ thống làm lạnh công nghiệp</li>
                    <li>Sản xuất chất tẩy rửa, thuốc nổ, tơ sợi tổng hợp</li>
                </ul>

                <h3>6. Ghi nhớ</h3>
                <p>Cặp electron tự do trên nitơ là chìa khóa của toàn bộ bài học: nó tạo nên hình dạng chóp tam giác, làm phân tử có cực, quyết định tính bazơ và khả năng tạo phức của amoniac.</p>
                """)
        .molecule(nh3)
        .build());

    lessonRepository.save(Lesson.builder()
        .title("Cấu trúc phân tử metan (CH₄)")
        .topic("Hình học phân tử")
        .difficulty("EASY")
        .content(
            """
                <h2>Phân tử metan - CH₄</h2>
                <p>Metan là ankan đơn giản nhất, gồm một nguyên tử cacbon liên kết với bốn nguyên tử hiđro. Đây là thành phần chính của khí thiên nhiên và khí biogas.</p>

                <h3>1. Các đặc trưng cơ bản</h3>
                <ul>
                    <li><strong>Công thức phân tử:</strong> CH₄</li>
                    <li><strong>Khối lượng mol:</strong> 16 g/mol</li>
                    <li><strong>Dạng hình học:</strong> Tứ diện đều</li>
                    <li><strong>Góc liên kết H–C–H:</strong> 109,5°</li>
                    <li><strong>Độ dài liên kết C–H:</strong> khoảng 0,109 nm</li>
                    <li><strong>Tính phân cực:</strong> Phân tử không cực</li>
                    <li><strong>Trạng thái lai hóa của cacbon:</strong> sp³</li>
                </ul>

                <h3>2. Lai hóa sp³ và hình tứ diện đều</h3>
                <p>Ở trạng thái cơ bản, cacbon có cấu hình 1s² 2s² 2p². Khi tạo liên kết, một electron của phân lớp 2s chuyển lên phân lớp 2p, sau đó một obitan 2s trộn với ba obitan 2p tạo thành bốn obitan lai hóa sp³ hoàn toàn giống nhau về hình dạng và năng lượng.</p>
                <p>Bốn obitan lai hóa này hướng về bốn đỉnh của một hình tứ diện đều để đẩy nhau ít nhất, tạo góc 109,5° giữa hai obitan bất kỳ. Mỗi obitan xen phủ với obitan 1s của một nguyên tử hiđro tạo một liên kết xigma C–H.</p>
                <p>Vì cacbon không còn cặp electron tự do nào, không có lực đẩy nào làm biến dạng phân tử. Đây là lý do metan giữ được góc 109,5° lý tưởng, khác với NH₃ và H₂O.</p>

                <h3>3. Tính đối xứng và tính không cực</h3>
                <p>Độ âm điện của cacbon là 2,55 và của hiđro là 2,20. Hiệu số nhỏ này khiến mỗi liên kết C–H có phân cực rất yếu.</p>
                <p>Tuy nhiên bốn liên kết C–H hoàn toàn giống nhau và hướng đối xứng ra bốn đỉnh tứ diện, nên bốn momen lưỡng cực nhỏ triệt tiêu lẫn nhau. Kết quả là momen lưỡng cực tổng bằng 0 và metan là phân tử không cực.</p>
                <p><strong>Bài học quan trọng:</strong> Phân tử có liên kết phân cực vẫn có thể không phân cực nếu hình dạng đủ đối xứng. CO₂ dạng thẳng và CCl₄ dạng tứ diện cũng là những ví dụ tương tự.</p>
                <p>Hệ quả của tính không cực: metan gần như không tan trong nước, không tạo liên kết hiđro, có nhiệt độ sôi rất thấp (−162°C) và chỉ tan trong dung môi không cực như benzen, xăng.</p>

                <h3>4. Tính chất hóa học</h3>
                <p><strong>Phản ứng cháy:</strong> Metan cháy trong oxi tỏa nhiều nhiệt, đây là cơ sở của việc dùng khí thiên nhiên làm nhiên liệu:</p>
                <p>CH₄ + 2O₂ → CO₂ + 2H₂O, biến thiên entanpi khoảng −890 kJ/mol</p>
                <p><strong>Phản ứng thế halogen:</strong> Khi chiếu sáng, metan tác dụng với clo theo cơ chế gốc tự do, thay thế lần lượt từng nguyên tử hiđro:</p>
                <p>CH₄ + Cl₂ → CH₃Cl + HCl (điều kiện ánh sáng)</p>
                <p>Phản ứng tiếp tục tạo CH₂Cl₂, CHCl₃ và cuối cùng là CCl₄.</p>
                <p><strong>Phản ứng nhiệt phân:</strong> Ở nhiệt độ rất cao, metan phân hủy thành axetilen hoặc thành cacbon và hiđro:</p>
                <p>2CH₄ → C₂H₂ + 3H₂ (1500°C, làm lạnh nhanh)</p>
                <p>Metan khá trơ ở điều kiện thường vì liên kết C–H bền và phân tử không có vùng tích điện để các chất phân cực tấn công.</p>

                <h3>5. Vai trò thực tế và vấn đề môi trường</h3>
                <ul>
                    <li>Là thành phần chính, khoảng 95%, của khí thiên nhiên dùng làm nhiên liệu và nguyên liệu hóa dầu</li>
                    <li>Nguyên liệu sản xuất khí tổng hợp, từ đó điều chế amoniac và metanol</li>
                    <li>Sinh ra từ quá trình phân hủy kị khí chất hữu cơ, được thu hồi làm khí biogas</li>
                    <li>Là khí gây hiệu ứng nhà kính mạnh, khả năng giữ nhiệt gấp khoảng 25 lần CO₂ tính trong 100 năm</li>
                </ul>

                <h3>6. Ghi nhớ</h3>
                <p>Metan là mẫu mực của lai hóa sp³: bốn liên kết giống nhau, không có cặp electron tự do, góc chuẩn 109,5°, đối xứng hoàn hảo nên không phân cực. Hãy dùng metan làm mốc so sánh khi xét hình học của NH₃ và H₂O.</p>
                """)
        .molecule(ch4)
        .build());

    lessonRepository.save(Lesson.builder()
        .title("Liên kết hóa học: cộng hóa trị và ion")
        .topic("Liên kết hóa học")
        .difficulty("MEDIUM")
        .content(
            """
                <h2>Các loại liên kết hóa học</h2>
                <p>Nguyên tử liên kết với nhau để đạt cấu hình electron bền vững, thường là cấu hình 8 electron ở lớp ngoài cùng giống khí hiếm. Cách các nguyên tử đạt được điều đó quyết định loại liên kết được tạo thành.</p>

                <h3>1. Liên kết cộng hóa trị</h3>
                <p>Liên kết cộng hóa trị hình thành khi hai nguyên tử <strong>dùng chung</strong> một hoặc nhiều cặp electron. Loại liên kết này thường gặp giữa các nguyên tố phi kim, nơi cả hai bên đều có xu hướng nhận thêm electron nên không bên nào nhường hẳn.</p>
                <p><strong>Phân loại theo số cặp electron dùng chung:</strong></p>
                <ul>
                    <li><strong>Liên kết đơn:</strong> dùng chung 1 cặp electron, ví dụ H–H trong H₂. Chỉ gồm một liên kết xigma, cho phép các nhóm nguyên tử quay quanh trục liên kết.</li>
                    <li><strong>Liên kết đôi:</strong> dùng chung 2 cặp electron, ví dụ O=O trong O₂. Gồm một liên kết xigma và một liên kết pi, làm phân tử cứng hơn và không quay được quanh trục.</li>
                    <li><strong>Liên kết ba:</strong> dùng chung 3 cặp electron, ví dụ N≡N trong N₂. Gồm một xigma và hai pi, là liên kết rất bền với năng lượng khoảng 945 kJ/mol. Chính độ bền này giải thích vì sao khí nitơ rất trơ ở điều kiện thường.</li>
                </ul>
                <p><strong>Phân loại theo độ phân cực:</strong></p>
                <ul>
                    <li><strong>Cộng hóa trị không cực:</strong> hai nguyên tử giống nhau hoặc có độ âm điện chênh lệch dưới 0,4. Cặp electron được chia đều, ví dụ H₂, Cl₂, N₂.</li>
                    <li><strong>Cộng hóa trị có cực:</strong> độ âm điện chênh lệch từ 0,4 đến dưới 1,7. Cặp electron bị lệch về nguyên tử có độ âm điện lớn hơn, ví dụ H–Cl, O–H.</li>
                </ul>

                <h3>2. Liên kết ion</h3>
                <p>Liên kết ion hình thành khi electron được <strong>chuyển hẳn</strong> từ nguyên tử kim loại sang nguyên tử phi kim, tạo ra hai ion trái dấu hút nhau bằng lực tĩnh điện.</p>
                <p><strong>Ví dụ với natri clorua:</strong></p>
                <ul>
                    <li>Natri có 1 electron ở lớp ngoài cùng, nhường electron này để đạt cấu hình khí hiếm: Na → Na⁺ + 1e</li>
                    <li>Clo có 7 electron ở lớp ngoài cùng, nhận thêm 1 electron: Cl + 1e → Cl⁻</li>
                    <li>Hai ion Na⁺ và Cl⁻ hút nhau tạo thành hợp chất ion NaCl</li>
                </ul>
                <p>Liên kết ion thường xuất hiện khi hiệu độ âm điện của hai nguyên tố lớn hơn 1,7. Với NaCl, hiệu này là 3,16 trừ 0,93 bằng 2,23 nên liên kết mang bản chất ion rõ rệt.</p>
                <p><strong>Đặc điểm quan trọng:</strong> Hợp chất ion không tồn tại dưới dạng phân tử riêng lẻ mà tạo thành mạng tinh thể, trong đó mỗi ion Na⁺ được bao quanh bởi 6 ion Cl⁻ và ngược lại. Công thức NaCl chỉ cho biết tỉ lệ số ion, không phải số nguyên tử trong một phân tử.</p>

                <h3>3. So sánh hai loại liên kết</h3>
                <table>
                    <tr><th>Tiêu chí</th><th>Cộng hóa trị</th><th>Ion</th></tr>
                    <tr><td>Cách tạo liên kết</td><td>Dùng chung electron</td><td>Chuyển hẳn electron</td></tr>
                    <tr><td>Nguyên tố tham gia</td><td>Phi kim với phi kim</td><td>Kim loại với phi kim</td></tr>
                    <tr><td>Hiệu độ âm điện</td><td>Dưới 1,7</td><td>Từ 1,7 trở lên</td></tr>
                    <tr><td>Trạng thái thường gặp</td><td>Khí, lỏng, rắn dễ nóng chảy</td><td>Tinh thể rắn</td></tr>
                    <tr><td>Nhiệt độ nóng chảy</td><td>Thường thấp</td><td>Rất cao, NaCl là 801°C</td></tr>
                    <tr><td>Dẫn điện</td><td>Không dẫn</td><td>Dẫn khi nóng chảy hoặc tan trong nước</td></tr>
                    <tr><td>Tính tan trong nước</td><td>Tùy độ phân cực</td><td>Phần lớn tan tốt</td></tr>
                </table>

                <h3>4. Liên kết kim loại</h3>
                <p>Ngoài hai loại trên còn có liên kết kim loại, hình thành giữa các nguyên tử kim loại. Các electron hóa trị tách khỏi nguyên tử và di chuyển tự do tạo thành biển electron bao quanh các ion dương ở nút mạng tinh thể.</p>
                <p>Chính các electron tự do này giải thích những tính chất đặc trưng của kim loại: dẫn điện tốt, dẫn nhiệt tốt, có ánh kim, dễ dát mỏng và kéo sợi.</p>

                <h3>5. Liên kết là một dải liên tục</h3>
                <p>Trong thực tế không có ranh giới tuyệt đối giữa các loại liên kết. Khi hiệu độ âm điện tăng dần, liên kết chuyển dần từ cộng hóa trị không cực sang cộng hóa trị có cực rồi sang ion:</p>
                <p>Cl–Cl với hiệu bằng 0, rồi H–Cl với hiệu 0,96, rồi Na–Cl với hiệu 2,23</p>
                <p>Vì vậy nên hiểu ba loại liên kết là ba vùng trên cùng một dải liên tục, thay vì ba ngăn riêng biệt.</p>

                <h3>6. Ghi nhớ</h3>
                <p>Muốn xác định loại liên kết, hãy làm hai bước: xét xem các nguyên tố là kim loại hay phi kim, rồi tính hiệu độ âm điện. Từ loại liên kết ta suy ra được trạng thái, nhiệt độ nóng chảy, khả năng dẫn điện và tính tan của chất.</p>
                """)
        .molecule(o2)
        .build());

    // Seed Questions - cau hoi tieng Viet, topic khop voi topic cua bai hoc
    questionRepository.save(Question.builder()
        .question("Phân tử nước (H₂O) có dạng hình học nào?")
        .optionA("Thẳng")
        .optionB("Góc (chữ V)")
        .optionC("Tam giác phẳng")
        .optionD("Tứ diện")
        .correctAnswer("B")
        .topic("Hình học phân tử")
        .difficulty("EASY")
        .build());

    questionRepository.save(Question.builder()
        .question("Góc liên kết H–O–H trong phân tử nước bằng bao nhiêu?")
        .optionA("90°")
        .optionB("120°")
        .optionC("104,5°")
        .optionD("109,5°")
        .correctAnswer("C")
        .topic("Hình học phân tử")
        .difficulty("EASY")
        .build());

    questionRepository.save(Question.builder()
        .question("Phân tử amoniac (NH₃) có dạng hình học nào?")
        .optionA("Tứ diện")
        .optionB("Tam giác phẳng")
        .optionC("Chóp tam giác")
        .optionD("Thẳng")
        .correctAnswer("C")
        .topic("Hình học phân tử")
        .difficulty("EASY")
        .build());

    questionRepository.save(Question.builder()
        .question("Trong phân tử metan (CH₄) tồn tại loại liên kết nào?")
        .optionA("Liên kết ion")
        .optionB("Liên kết cộng hóa trị")
        .optionC("Liên kết kim loại")
        .optionD("Liên kết hiđro")
        .correctAnswer("B")
        .topic("Liên kết hóa học")
        .difficulty("EASY")
        .build());

    questionRepository.save(Question.builder()
        .question("Nguyên tử oxi trong phân tử H₂O có bao nhiêu cặp electron không liên kết?")
        .optionA("0")
        .optionB("1")
        .optionC("2")
        .optionD("3")
        .correctAnswer("C")
        .topic("Hình học phân tử")
        .difficulty("MEDIUM")
        .build());

    questionRepository.save(Question.builder()
        .question("Nguyên tử cacbon trong phân tử metan ở trạng thái lai hóa nào?")
        .optionA("sp")
        .optionB("sp²")
        .optionC("sp³")
        .optionD("sp³d")
        .correctAnswer("C")
        .topic("Hình học phân tử")
        .difficulty("MEDIUM")
        .build());

    questionRepository.save(Question.builder()
        .question("Phân tử cacbon đioxit (CO₂) có dạng hình học nào?")
        .optionA("Góc")
        .optionB("Thẳng")
        .optionC("Tam giác phẳng")
        .optionD("Tứ diện")
        .correctAnswer("B")
        .topic("Hình học phân tử")
        .difficulty("EASY")
        .build());

    questionRepository.save(Question.builder()
        .question("Trong phân tử nitơ (N₂) có loại liên kết nào?")
        .optionA("Liên kết đơn")
        .optionB("Liên kết đôi")
        .optionC("Liên kết ba")
        .optionD("Liên kết ion")
        .correctAnswer("C")
        .topic("Liên kết hóa học")
        .difficulty("EASY")
        .build());

    questionRepository.save(Question.builder()
        .question("Phân tử nào sau đây là phân tử không cực?")
        .optionA("H₂O")
        .optionB("NH₃")
        .optionC("HCl")
        .optionD("CH₄")
        .correctAnswer("D")
        .topic("Hình học phân tử")
        .difficulty("MEDIUM")
        .build());

    questionRepository.save(Question.builder()
        .question("Trong liên kết ion, các electron được:")
        .optionA("Dùng chung đồng đều")
        .optionB("Dùng chung không đồng đều")
        .optionC("Chuyển hẳn từ nguyên tử này sang nguyên tử khác")
        .optionD("Phá hủy hoàn toàn")
        .correctAnswer("C")
        .topic("Liên kết hóa học")
        .difficulty("EASY")
        .build());

    seedClasses(student, teacher, student2, teacher2);

    System.out.println("=== Seeding reaction data ===");

    // Seed Reactions
    reactionRepository.save(Reaction.builder()
        .name("Phản ứng tạo thành nước")
        .equation("2H₂ + O₂ → 2H₂O")
        .description(
            "Khí hiđro tác dụng với khí oxi tạo thành nước. Đây là phản ứng tổng hợp tỏa nhiệt rất mạnh.")
        .reactionType("SYNTHESIS")
        .reactantsData("""
            {
              "molecules": [
                {
                  "name": "H2",
                  "atoms": [
                    {"element": "H", "x": -3, "y": 0, "z": 0},
                    {"element": "H", "x": -2.2, "y": 0, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1}]
                },
                {
                  "name": "H2_2",
                  "atoms": [
                    {"element": "H", "x": -3, "y": 1.5, "z": 0},
                    {"element": "H", "x": -2.2, "y": 1.5, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1}]
                },
                {
                  "name": "O2",
                  "atoms": [
                    {"element": "O", "x": 2, "y": 0.75, "z": 0},
                    {"element": "O", "x": 3, "y": 0.75, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 2}]
                }
              ]
            }
            """)
        .productsData("""
            {
              "molecules": [
                {
                  "name": "H2O_1",
                  "atoms": [
                    {"element": "O", "x": -1, "y": 0, "z": 0},
                    {"element": "H", "x": -1.8, "y": 0.6, "z": 0},
                    {"element": "H", "x": -0.2, "y": 0.6, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1}, {"from": 0, "to": 2, "order": 1}]
                },
                {
                  "name": "H2O_2",
                  "atoms": [
                    {"element": "O", "x": 2, "y": 0, "z": 0},
                    {"element": "H", "x": 1.2, "y": 0.6, "z": 0},
                    {"element": "H", "x": 2.8, "y": 0.6, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1}, {"from": 0, "to": 2, "order": 1}]
                }
              ]
            }
            """)
        .animationSteps(
            """
                {
                  "steps": [
                    {"label": "Chất tham gia", "description": "Các liên kết H-H và O=O còn nguyên vẹn", "phase": "initial"},
                    {"label": "Phá vỡ liên kết", "description": "Các liên kết đơn H-H và liên kết đôi O=O bị phá vỡ", "phase": "breaking"},
                    {"label": "Sắp xếp lại nguyên tử", "description": "Các nguyên tử hiđro di chuyển về phía nguyên tử oxi", "phase": "transition"},
                    {"label": "Hình thành liên kết", "description": "Các liên kết O-H mới hình thành tạo nên phân tử nước", "phase": "forming"},
                    {"label": "Sản phẩm", "description": "Hai phân tử H₂O được tạo thành", "phase": "final"}
                  ]
                }
                """)
        .build());

    reactionRepository.save(Reaction.builder()
        .name("Phản ứng cháy của metan")
        .equation("CH₄ + 2O₂ → CO₂ + 2H₂O")
        .description(
            "Metan cháy trong oxi tạo ra cacbon đioxit và nước. Đây là phản ứng chính khi đốt khí thiên nhiên.")
        .reactionType("COMBUSTION")
        .reactantsData(
            """
                {
                  "molecules": [
                    {
                      "name": "CH4",
                      "atoms": [
                        {"element": "C", "x": -2.5, "y": 0, "z": 0},
                        {"element": "H", "x": -3.1, "y": 0.6, "z": 0.5},
                        {"element": "H", "x": -1.9, "y": 0.6, "z": -0.5},
                        {"element": "H", "x": -3.1, "y": -0.6, "z": -0.5},
                        {"element": "H", "x": -1.9, "y": -0.6, "z": 0.5}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1},{"from": 0, "to": 2, "order": 1},{"from": 0, "to": 3, "order": 1},{"from": 0, "to": 4, "order": 1}]
                    },
                    {
                      "name": "O2_1",
                      "atoms": [
                        {"element": "O", "x": 1.5, "y": 1, "z": 0},
                        {"element": "O", "x": 2.5, "y": 1, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 2}]
                    },
                    {
                      "name": "O2_2",
                      "atoms": [
                        {"element": "O", "x": 1.5, "y": -1, "z": 0},
                        {"element": "O", "x": 2.5, "y": -1, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 2}]
                    }
                  ]
                }
                """)
        .productsData("""
            {
              "molecules": [
                {
                  "name": "CO2",
                  "atoms": [
                    {"element": "C", "x": -1, "y": 0, "z": 0},
                    {"element": "O", "x": -2.1, "y": 0, "z": 0},
                    {"element": "O", "x": 0.1, "y": 0, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 2},{"from": 0, "to": 2, "order": 2}]
                },
                {
                  "name": "H2O_1",
                  "atoms": [
                    {"element": "O", "x": 2, "y": 1, "z": 0},
                    {"element": "H", "x": 1.3, "y": 1.5, "z": 0},
                    {"element": "H", "x": 2.7, "y": 1.5, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1},{"from": 0, "to": 2, "order": 1}]
                },
                {
                  "name": "H2O_2",
                  "atoms": [
                    {"element": "O", "x": 2, "y": -1, "z": 0},
                    {"element": "H", "x": 1.3, "y": -0.5, "z": 0},
                    {"element": "H", "x": 2.7, "y": -0.5, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1},{"from": 0, "to": 2, "order": 1}]
                }
              ]
            }
            """)
        .animationSteps(
            """
                {
                  "steps": [
                    {"label": "Chất tham gia", "description": "Các phân tử CH₄ và O₂ trước khi phản ứng", "phase": "initial"},
                    {"label": "Phá vỡ liên kết", "description": "Các liên kết C-H và O=O bị phá vỡ", "phase": "breaking"},
                    {"label": "Sắp xếp lại nguyên tử", "description": "Nguyên tử cacbon tiến về phía oxi, các nguyên tử hiđro tái sắp xếp", "phase": "transition"},
                    {"label": "Hình thành liên kết", "description": "Các liên kết đôi C=O và liên kết O-H hình thành", "phase": "forming"},
                    {"label": "Sản phẩm", "description": "Tạo thành CO₂ và hai phân tử H₂O", "phase": "final"}
                  ]
                }
                """)
        .build());

    reactionRepository.save(Reaction.builder()
        .name("Phản ứng tổng hợp amoniac")
        .equation("N₂ + 3H₂ → 2NH₃")
        .description(
            "Quy trình Haber: nitơ và hiđro kết hợp tạo thành amoniac ở áp suất và nhiệt độ cao.")
        .reactionType("SYNTHESIS")
        .reactantsData("""
            {
              "molecules": [
                {
                  "name": "N2",
                  "atoms": [
                    {"element": "N", "x": -2, "y": 0, "z": 0},
                    {"element": "N", "x": -1, "y": 0, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 3}]
                },
                {
                  "name": "H2_1",
                  "atoms": [
                    {"element": "H", "x": 1.5, "y": 1.5, "z": 0},
                    {"element": "H", "x": 2.3, "y": 1.5, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1}]
                },
                {
                  "name": "H2_2",
                  "atoms": [
                    {"element": "H", "x": 1.5, "y": 0, "z": 0},
                    {"element": "H", "x": 2.3, "y": 0, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1}]
                },
                {
                  "name": "H2_3",
                  "atoms": [
                    {"element": "H", "x": 1.5, "y": -1.5, "z": 0},
                    {"element": "H", "x": 2.3, "y": -1.5, "z": 0}
                  ],
                  "bonds": [{"from": 0, "to": 1, "order": 1}]
                }
              ]
            }
            """)
        .productsData(
            """
                {
                  "molecules": [
                    {
                      "name": "NH3_1",
                      "atoms": [
                        {"element": "N", "x": -1.5, "y": 0.5, "z": 0},
                        {"element": "H", "x": -2.2, "y": 1, "z": 0.4},
                        {"element": "H", "x": -0.8, "y": 1, "z": 0.4},
                        {"element": "H", "x": -1.5, "y": 1, "z": -0.6}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1},{"from": 0, "to": 2, "order": 1},{"from": 0, "to": 3, "order": 1}]
                    },
                    {
                      "name": "NH3_2",
                      "atoms": [
                        {"element": "N", "x": 1.5, "y": -0.5, "z": 0},
                        {"element": "H", "x": 0.8, "y": 0, "z": 0.4},
                        {"element": "H", "x": 2.2, "y": 0, "z": 0.4},
                        {"element": "H", "x": 1.5, "y": 0, "z": -0.6}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1},{"from": 0, "to": 2, "order": 1},{"from": 0, "to": 3, "order": 1}]
                    }
                  ]
                }
                """)
        .animationSteps(
            """
                {
                  "steps": [
                    {"label": "Chất tham gia", "description": "Liên kết ba N≡N và các liên kết H-H còn nguyên vẹn", "phase": "initial"},
                    {"label": "Phá vỡ liên kết", "description": "Liên kết ba N≡N và các liên kết H-H bị phá vỡ, cần năng lượng lớn", "phase": "breaking"},
                    {"label": "Sắp xếp lại nguyên tử", "description": "Các nguyên tử hiđro di chuyển về phía nguyên tử nitơ", "phase": "transition"},
                    {"label": "Hình thành liên kết", "description": "Các liên kết N-H hình thành, tạo nên phân tử amoniac", "phase": "forming"},
                    {"label": "Sản phẩm", "description": "Hai phân tử NH₃ được tạo thành theo quy trình Haber", "phase": "final"}
                  ]
                }
                """)
        .build());

    reactionRepository.save(Reaction.builder()
        .name("Phản ứng tạo kết tủa bạc clorua")
        .equation("AgNO₃ + NaCl → AgCl↓ + NaNO₃")
        .description(
            "Bạc nitrat tác dụng với natri clorua tạo ra kết tủa bạc clorua màu trắng.")
        .reactionType("DOUBLE_DISPLACEMENT")
        .reactantsData(
            """
                {
                  "molecules": [
                    {
                      "name": "AgNO3",
                      "atoms": [
                        {"element": "Ag", "x": -2.0, "y": 0.2, "z": 0},
                        {"element": "N", "x": -1.1, "y": 0.2, "z": 0},
                        {"element": "O", "x": -0.4, "y": 0.9, "z": 0},
                        {"element": "O", "x": -0.4, "y": -0.5, "z": 0.55},
                        {"element": "O", "x": -0.4, "y": -0.5, "z": -0.55}
                      ],
                      "bonds": [
                        {"from": 1, "to": 2, "order": 2},
                        {"from": 1, "to": 3, "order": 1},
                        {"from": 1, "to": 4, "order": 1},
                        {"from": 0, "to": 1, "order": 1}
                      ]
                    },
                    {
                      "name": "NaCl",
                      "atoms": [
                        {"element": "Na", "x": 1.8, "y": 0.2, "z": 0},
                        {"element": "Cl", "x": 2.7, "y": 0.2, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1}]
                    }
                  ]
                }
                """)
        .productsData(
            """
                {
                  "molecules": [
                    {
                      "name": "AgCl",
                      "atoms": [
                        {"element": "Ag", "x": -0.6, "y": -0.8, "z": 0},
                        {"element": "Cl", "x": 0.2, "y": -0.8, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1}]
                    },
                    {
                      "name": "NaNO3",
                      "atoms": [
                        {"element": "Na", "x": 2.2, "y": 0.2, "z": 0},
                        {"element": "N", "x": 3.1, "y": 0.2, "z": 0},
                        {"element": "O", "x": 3.8, "y": 0.9, "z": 0},
                        {"element": "O", "x": 3.8, "y": -0.45, "z": 0.55},
                        {"element": "O", "x": 3.8, "y": -0.45, "z": -0.55}
                      ],
                      "bonds": [
                        {"from": 1, "to": 2, "order": 2},
                        {"from": 1, "to": 3, "order": 1},
                        {"from": 1, "to": 4, "order": 1},
                        {"from": 0, "to": 1, "order": 1}
                      ]
                    }
                  ]
                }
                """)
        .animationSteps(
            """
                {
                  "effects": {
                    "mode": "PRECIPITATION",
                    "vapor": false,
                    "precipitate": true,
                    "precipitateIntensity": 1.0,
                    "bubbles": false,
                    "heat": false,
                    "startTemp": 25,
                    "maxTemp": 30,
                    "liquidColorStart": "#4ea7f0",
                    "liquidColorEnd": "#c4ccd9"
                  },
                  "steps": [
                    {"label": "Trộn dung dịch", "description": "Trộn dung dịch AgNO₃ với dung dịch NaCl", "phase": "initial"},
                    {"label": "Trao đổi ion", "description": "Ion Ag⁺ gặp ion Cl⁻ và tạo mầm kết tủa AgCl", "phase": "breaking"},
                    {"label": "Tạo kết tủa", "description": "Các hạt AgCl lớn dần và trở nên nhìn thấy được", "phase": "transition"},
                    {"label": "Kết tủa lắng xuống", "description": "Kết tủa AgCl màu trắng lắng xuống đáy", "phase": "forming"},
                    {"label": "Sản phẩm", "description": "Còn lại kết tủa AgCl và dung dịch NaNO₃", "phase": "final"}
                  ]
                }
                """)
        .build());

    reactionRepository.save(Reaction.builder()
        .name("Phản ứng tạo kết tủa canxi cacbonat")
        .equation("CaCl₂ + Na₂CO₃ → CaCO₃↓ + 2NaCl")
        .description(
            "Canxi clorua tác dụng với natri cacbonat tạo ra kết tủa canxi cacbonat không tan.")
        .reactionType("DOUBLE_DISPLACEMENT")
        .reactantsData(
            """
                {
                  "molecules": [
                    {
                      "name": "CaCl2",
                      "atoms": [
                        {"element": "Ca", "x": -2.2, "y": 0.2, "z": 0},
                        {"element": "Cl", "x": -3.1, "y": 0.7, "z": 0},
                        {"element": "Cl", "x": -3.1, "y": -0.3, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1}, {"from": 0, "to": 2, "order": 1}]
                    },
                    {
                      "name": "Na2CO3",
                      "atoms": [
                        {"element": "Na", "x": 1.7, "y": 0.7, "z": 0},
                        {"element": "Na", "x": 1.7, "y": -0.3, "z": 0},
                        {"element": "C", "x": 2.7, "y": 0.2, "z": 0},
                        {"element": "O", "x": 3.5, "y": 0.9, "z": 0},
                        {"element": "O", "x": 3.5, "y": -0.5, "z": 0.55},
                        {"element": "O", "x": 3.5, "y": -0.5, "z": -0.55}
                      ],
                      "bonds": [
                        {"from": 2, "to": 3, "order": 2},
                        {"from": 2, "to": 4, "order": 1},
                        {"from": 2, "to": 5, "order": 1},
                        {"from": 0, "to": 2, "order": 1},
                        {"from": 1, "to": 2, "order": 1}
                      ]
                    }
                  ]
                }
                """)
        .productsData(
            """
                {
                  "molecules": [
                    {
                      "name": "CaCO3",
                      "atoms": [
                        {"element": "Ca", "x": -0.6, "y": -0.8, "z": 0},
                        {"element": "C", "x": 0.2, "y": -0.8, "z": 0},
                        {"element": "O", "x": 0.95, "y": -0.2, "z": 0},
                        {"element": "O", "x": 0.95, "y": -1.3, "z": 0.45},
                        {"element": "O", "x": 0.95, "y": -1.3, "z": -0.45}
                      ],
                      "bonds": [
                        {"from": 1, "to": 2, "order": 2},
                        {"from": 1, "to": 3, "order": 1},
                        {"from": 1, "to": 4, "order": 1},
                        {"from": 0, "to": 1, "order": 1}
                      ]
                    },
                    {
                      "name": "NaCl_1",
                      "atoms": [
                        {"element": "Na", "x": 2.2, "y": 0.5, "z": 0},
                        {"element": "Cl", "x": 3.0, "y": 0.5, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1}]
                    },
                    {
                      "name": "NaCl_2",
                      "atoms": [
                        {"element": "Na", "x": 2.2, "y": -0.5, "z": 0},
                        {"element": "Cl", "x": 3.0, "y": -0.5, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1}]
                    }
                  ]
                }
                """)
        .animationSteps(
            """
                {
                  "effects": {
                    "mode": "PRECIPITATION",
                    "vapor": false,
                    "precipitate": true,
                    "precipitateIntensity": 1.0,
                    "bubbles": false,
                    "heat": false,
                    "startTemp": 25,
                    "maxTemp": 30,
                    "liquidColorStart": "#59b0f5",
                    "liquidColorEnd": "#bcc4d0"
                  },
                  "steps": [
                    {"label": "Trộn dung dịch", "description": "CaCl₂ và Na₂CO₃ tan trong nước trước khi trao đổi ion", "phase": "initial"},
                    {"label": "Trao đổi ion", "description": "Ion Ca²⁺ và ion CO₃²⁻ gặp nhau và bắt đầu liên kết", "phase": "breaking"},
                    {"label": "Tạo mầm tinh thể", "description": "Mầm CaCO₃ hình thành dưới dạng các hạt mịn lơ lửng", "phase": "transition"},
                    {"label": "Kết tủa lớn dần", "description": "Các hạt kết tụ thành chất rắn màu trắng nhìn thấy được", "phase": "forming"},
                    {"label": "Sản phẩm", "description": "CaCO₃ lắng xuống còn NaCl vẫn tan trong dung dịch", "phase": "final"}
                  ]
                }
                """)
        .build());

    reactionRepository.save(Reaction.builder()
        .name("Phản ứng phân hủy hiđro peoxit")
        .equation("2H₂O₂ → 2H₂O + O₂↑")
        .description(
            "Hiđro peoxit phân hủy thành nước và khí oxi, tạo bọt khí mạnh và giải phóng hơi nước.")
        .reactionType("DECOMPOSITION")
        .reactantsData(
            """
                {
                  "molecules": [
                    {
                      "name": "H2O2_1",
                      "atoms": [
                        {"element": "H", "x": -2.3, "y": 0.5, "z": 0},
                        {"element": "O", "x": -1.6, "y": 0.5, "z": 0},
                        {"element": "O", "x": -0.9, "y": 0.5, "z": 0},
                        {"element": "H", "x": -0.2, "y": 0.5, "z": 0}
                      ],
                      "bonds": [
                        {"from": 0, "to": 1, "order": 1},
                        {"from": 1, "to": 2, "order": 1},
                        {"from": 2, "to": 3, "order": 1}
                      ]
                    },
                    {
                      "name": "H2O2_2",
                      "atoms": [
                        {"element": "H", "x": -2.3, "y": -0.5, "z": 0},
                        {"element": "O", "x": -1.6, "y": -0.5, "z": 0},
                        {"element": "O", "x": -0.9, "y": -0.5, "z": 0},
                        {"element": "H", "x": -0.2, "y": -0.5, "z": 0}
                      ],
                      "bonds": [
                        {"from": 0, "to": 1, "order": 1},
                        {"from": 1, "to": 2, "order": 1},
                        {"from": 2, "to": 3, "order": 1}
                      ]
                    }
                  ]
                }
                """)
        .productsData(
            """
                {
                  "molecules": [
                    {
                      "name": "H2O_1",
                      "atoms": [
                        {"element": "O", "x": 1.3, "y": 0.8, "z": 0},
                        {"element": "H", "x": 0.6, "y": 1.3, "z": 0},
                        {"element": "H", "x": 2.0, "y": 1.3, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1}, {"from": 0, "to": 2, "order": 1}]
                    },
                    {
                      "name": "H2O_2",
                      "atoms": [
                        {"element": "O", "x": 1.3, "y": -0.8, "z": 0},
                        {"element": "H", "x": 0.6, "y": -0.3, "z": 0},
                        {"element": "H", "x": 2.0, "y": -0.3, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 1}, {"from": 0, "to": 2, "order": 1}]
                    },
                    {
                      "name": "O2",
                      "atoms": [
                        {"element": "O", "x": 3.4, "y": 0.0, "z": 0},
                        {"element": "O", "x": 4.3, "y": 0.0, "z": 0}
                      ],
                      "bonds": [{"from": 0, "to": 1, "order": 2}]
                    }
                  ]
                }
                """)
        .animationSteps(
            """
                {
                  "effects": {
                    "mode": "GAS_EVOLUTION",
                    "vapor": true,
                    "vaporIntensity": 1.1,
                    "precipitate": false,
                    "bubbles": true,
                    "bubblesIntensity": 1.0,
                    "heat": true,
                    "heatIntensity": 0.6,
                    "startTemp": 24,
                    "maxTemp": 48,
                    "liquidColorStart": "#4da4eb",
                    "liquidColorEnd": "#89b6d0"
                  },
                  "steps": [
                    {"label": "Ban đầu", "description": "Các phân tử H₂O₂ tan trong cốc thủy tinh", "phase": "initial"},
                    {"label": "Hoạt hóa liên kết", "description": "Liên kết đơn O-O trong peoxit bắt đầu bị phá vỡ", "phase": "breaking"},
                    {"label": "Tạo khí", "description": "Các nguyên tử oxi ghép đôi tạo thành khí O₂", "phase": "transition"},
                    {"label": "Bubble Release", "description": "O₂ bubbles rise through solution and escape", "phase": "forming"},
                    {"label": "Sản phẩm", "description": "Còn lại nước, quá trình giải phóng khí oxi đã kết thúc", "phase": "final"}
                  ]
                }
                """)
        .build());

    System.out.println("=== Demo data seeded successfully ===");
  }

  /**
   * Lop hoc mau: quan tri vien tao lop, gan hoc sinh, giao vien, bai hoc va bai kiem tra.
   * Lop 10A1: bai hoc hinh hoc phan tu + 1 bai kiem tra; lop 11A1: bai hoc lien ket hoa hoc.
   */
  private void seedClasses(User student, User teacher, User student2, User teacher2) {
    java.util.List<Lesson> lessons = lessonRepository.findAll();
    java.util.List<Question> geometryQuestions = questionRepository.findByTopic("Hình học phân tử");

    Exam exam = examRepository.save(Exam.builder()
        .title("Kiểm tra 15 phút: Hình học phân tử")
        .description("Bài kiểm tra mẫu được quản trị viên giao cho lớp 10A1.")
        .createdBy(teacher)
        .timeLimitMinutes(15)
        .randomOrder(true)
        .topic("Hình học phân tử")
        .active(true)
        .questions(new java.util.ArrayList<>(geometryQuestions.subList(0, Math.min(5, geometryQuestions.size()))))
        .build());

    ClassRoom class10 = ClassRoom.builder()
        .name("10A1")
        .gradeLevel(10)
        .schoolYear("2026-2027")
        .description("Lớp mẫu khối 10")
        .build();
    class10.getTeachers().add(teacher);
    lessons.stream().filter(l -> "Hình học phân tử".equals(l.getTopic())).forEach(class10.getLessons()::add);
    class10.getExams().add(exam);
    class10 = classRoomRepository.save(class10);

    ClassRoom class11 = ClassRoom.builder()
        .name("11A1")
        .gradeLevel(11)
        .schoolYear("2026-2027")
        .description("Lớp mẫu khối 11")
        .build();
    class11.getTeachers().add(teacher2);
    lessons.stream().filter(l -> "Liên kết hóa học".equals(l.getTopic())).forEach(class11.getLessons()::add);
    class11 = classRoomRepository.save(class11);

    student.setClassRoom(class10);
    userRepository.save(student);
    student2.setClassRoom(class11);
    userRepository.save(student2);
  }
}
