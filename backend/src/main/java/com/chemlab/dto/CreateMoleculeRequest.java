package com.chemlab.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateMoleculeRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String formula;

    private String description;
    private String atomData;
    private String atomsData;
    private String bondsData;
}
