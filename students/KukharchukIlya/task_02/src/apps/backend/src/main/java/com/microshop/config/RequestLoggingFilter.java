package com.microshop.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
@Slf4j
public class RequestLoggingFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String method = httpRequest.getMethod();
        String uri = httpRequest.getRequestURI();
        String queryString = httpRequest.getQueryString();
        String fullPath = queryString == null ? uri : uri + "?" + queryString;
        
        long startTime = System.currentTimeMillis();
        
        log.info(">>> {} {}", method, fullPath);
        
        try {
            chain.doFilter(request, response);
            long duration = System.currentTimeMillis() - startTime;
            log.info("<<< {} {} - Status: {} - Time: {}ms", 
                method, fullPath, httpResponse.getStatus(), duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("<<< {} {} - ERROR after {}ms: {}", 
                method, fullPath, duration, e.getMessage());
            throw e;
        }
    }
}
