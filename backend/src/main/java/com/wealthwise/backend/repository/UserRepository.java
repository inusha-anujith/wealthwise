package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @Repository tells Spring Boot that this interface is responsible for database communication.
 * 
 * OOP Concept (Inheritance): We 'extend' JpaRepository. This gives us dozens of built-in 
 * database methods for free (save, delete, findById) specifically for the 'User' entity.
 */

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * don't need to write SQL for this
     * Just by naming the method 'findByEmail', Spring Boot automatically generates the SQL:
     * "SELECT * FROM users WHERE email = ?"
     * 
     * Optional<User>: A modern Java feature preventing NullPointerExceptions. It means "A user might be returned, or it might be empty."
     */
    Optional<User> findByEmail(String email);
}