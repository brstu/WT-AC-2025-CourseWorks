package com.vladislaukuzhyr.server.mapper;

import com.vladislaukuzhyr.server.dto.invoice.InvoiceCreateDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceReadDto;
import com.vladislaukuzhyr.server.dto.invoice.InvoiceUpdateDto;
import com.vladislaukuzhyr.server.dto.deal.DealReadDto;
import com.vladislaukuzhyr.server.entity.Invoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = DealMapper.class)
public interface InvoiceMapper {
  @Mapping(target = "dealId", expression = "java(invoice.getDeal() == null ? null : invoice.getDeal().getId())")
  @Mapping(target = "userId", expression = "java(invoice.getUser() == null ? null : invoice.getUser().getId())")
  @Mapping(target = "deal", source = "deal")
  InvoiceReadDto toReadDto(Invoice invoice);

  Invoice toEntity(InvoiceCreateDto dto);
  
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "user", ignore = true)
  void updateFromDto(InvoiceUpdateDto dto, @MappingTarget Invoice entity);
}
