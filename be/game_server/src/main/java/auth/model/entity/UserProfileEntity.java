package auth.model.entity;

import auth.domain.UserRole;
import jakarta.persistence.*;

@Entity
@Table(name = "user_profile")
public class UserProfileEntity {
    // 사용자 고유 식별자
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "uuid")
    private String uuid;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;
}
