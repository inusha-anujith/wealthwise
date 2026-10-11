package com.wealthwise.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

// NOTE: By implementing UserDetails, I integrate this JPA entity directly into Spring Security's authentication manager.
@Data
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // NOTE: Passwords must NEVER be stored in plain text. This will hold the Bcrypt hashed version.
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String baseCurrency = "LKR";

    /*
     * NOTE: The methods below are required by the UserDetails interface.
     * They tell Spring Security what permissions the user has and if their account is active.
     */
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Assigning a default 'USER' role for basic authorization.
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        // We use email as the unique username for logging in.
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}