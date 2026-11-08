package com.wealthwise.backend;

import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Sends real requests through security, controllers and the database.
// @Transactional rolls back every change after each test.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void otherUserCannotSeeOrDeleteTransactions() throws Exception {
        Cookie alice = signUp();
        Cookie bob = signUp();

        int id = create(alice, "/api/transactions",
                "{\"category\":\"SALARY\",\"amount\":1000,\"transactionDate\":\"2026-01-01\"}");

        mockMvc.perform(get("/api/transactions").cookie(bob))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        mockMvc.perform(delete("/api/transactions/" + id).cookie(bob))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/transactions").cookie(alice))
                .andExpect(content().string(containsString("\"id\":" + id)));
    }

    @Test
    void otherUserCannotTouchStocksOrDividends() throws Exception {
        Cookie alice = signUp();
        Cookie bob = signUp();

        int id = create(alice, "/api/assets",
                "{\"tickerSymbol\":\"JKH.N\",\"sharesOwned\":10,\"averagePurchasePrice\":20,\"deductFromCash\":true}");

        mockMvc.perform(get("/api/assets").cookie(bob))
                .andExpect(content().json("[]"));

        mockMvc.perform(put("/api/assets/" + id + "/price").cookie(bob)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"currentPrice\":1}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/assets/" + id + "/sales").cookie(bob)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sharesSold\":1,\"salePrice\":20,\"saleDate\":\"2026-01-01\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/dividends").cookie(bob)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"assetId\":" + id + ",\"amount\":999,\"paymentDate\":\"2026-01-01\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/assets/" + id).cookie(bob))
                .andExpect(status().isNotFound());
    }

    @Test
    void otherUserCannotTouchFixedDeposits() throws Exception {
        Cookie alice = signUp();
        Cookie bob = signUp();

        int id = create(alice, "/api/fixed-deposits",
                "{\"bankName\":\"HNB\",\"principalAmount\":50000,\"interestRate\":10,"
                        + "\"startDate\":\"2025-01-01\",\"durationMonths\":12,\"deductFromCash\":true}");

        mockMvc.perform(get("/api/fixed-deposits").cookie(bob))
                .andExpect(content().json("[]"));

        mockMvc.perform(post("/api/fixed-deposits/" + id + "/mature").cookie(bob))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/fixed-deposits/" + id).cookie(bob))
                .andExpect(status().isNotFound());
    }

    @Test
    void responsesNeverIncludeUserDetails() throws Exception {
        Cookie alice = signUp();

        mockMvc.perform(post("/api/assets").cookie(alice)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tickerSymbol\":\"JKH.N\",\"sharesOwned\":10,\"averagePurchasePrice\":20,\"deductFromCash\":false}"))
                .andExpect(status().isCreated())
                .andExpect(content().string(not(containsString("password"))))
                .andExpect(content().string(not(containsString("\"user\""))));
    }

    @Test
    void requestsWithoutAValidLoginAreRefused() throws Exception {
        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/transactions").cookie(new Cookie("jwt", "not-a-real-token")))
                .andExpect(status().isUnauthorized());
    }

    // Creates a new user with a unique email and returns their HttpOnly login cookie.
    private Cookie signUp() throws Exception {
        String email = "test-" + UUID.randomUUID() + "@test.com";

        return mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Test12345\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie("jwt");
    }

    // Sends a POST as this user, checks it was created and returns the new record's id.
    private int create(Cookie user, String url, String json) throws Exception {
        String body = mockMvc.perform(post(url).cookie(user)
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return JsonPath.read(body, "$.id");
    }
}