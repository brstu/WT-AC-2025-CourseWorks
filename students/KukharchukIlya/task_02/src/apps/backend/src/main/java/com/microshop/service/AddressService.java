package com.microshop.service;

import com.microshop.model.Address;
import com.microshop.model.User;
import com.microshop.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {
    
    private final AddressRepository addressRepository;
    
    public List<Address> getAddresses(User user) {
        return addressRepository.findByUser(user);
    }
    
    @Transactional
    public Address createAddress(User user, Address address) {
        address.setUser(user);
        return addressRepository.save(address);
    }
    
    @Transactional
    public Address updateAddress(UUID id, User user, Address address) {
        Address existing = addressRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (address.getStreet() != null) existing.setStreet(address.getStreet());
        if (address.getCity() != null) existing.setCity(address.getCity());
        if (address.getPostalCode() != null) existing.setPostalCode(address.getPostalCode());
        if (address.getCountry() != null) existing.setCountry(address.getCountry());
        if (address.getIsDefault() != null) existing.setIsDefault(address.getIsDefault());
        
        return addressRepository.save(existing);
    }
    
    @Transactional
    public void deleteAddress(UUID id, User user) {
        Address address = addressRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        addressRepository.delete(address);
    }
}
