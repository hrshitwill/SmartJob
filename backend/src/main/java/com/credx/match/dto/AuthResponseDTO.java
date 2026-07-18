package com.credx.match.dto;

public class AuthResponseDTO {

    private String id;
    private String email;
    private String name;
    private String role;
    private String token;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String id, String email, String name, String role, String token) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.token = token;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
