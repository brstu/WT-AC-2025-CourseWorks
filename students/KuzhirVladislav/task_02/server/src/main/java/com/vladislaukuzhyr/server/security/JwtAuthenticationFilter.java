package com.vladislaukuzhyr.server.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  private final JwtUtils jwtUtils;
  private final UserDetailsService userDetailsService;

  public JwtAuthenticationFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
    this.jwtUtils = jwtUtils;
    this.userDetailsService = userDetailsService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    try {
      String jwt = parseJwt(request);
      if (jwt == null) {
        logger.debug("No Authorization header with Bearer token present in request {} {}", request.getMethod(), request.getRequestURI());
      } else if (!jwtUtils.validateToken(jwt)) {
        logger.warn("JWT token validation failed for request {} {}", request.getMethod(), request.getRequestURI());
      } else {
        String username = jwtUtils.getUsernameFromToken(jwt);
        Long userId = jwtUtils.getUserIdFromToken(jwt);
        if (username != null) {
          UserDetails userDetails = userDetailsService.loadUserByUsername(username);
          UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
              userDetails, null, userDetails.getAuthorities());
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          request.setAttribute("userId", userId);
          SecurityContextHolder.getContext().setAuthentication(authentication);
          logger.debug("Authenticated user '{}' with userId '{}' for request {} {}", username, userId, request.getMethod(), request.getRequestURI());
        } else {
          logger.warn("Username extracted from JWT is null for request {} {}", request.getMethod(), request.getRequestURI());
        }
      }
    } catch (Exception ex) {
      logger.error("Error while processing JWT authentication", ex);
    }
    filterChain.doFilter(request, response);
  }

  private String parseJwt(HttpServletRequest request) {
    String headerAuth = request.getHeader("Authorization");
    if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
      return headerAuth.substring(7);
    }
    return null;
  }
}
