package com.chemlab.service;

import com.chemlab.dto.CreateMoleculeRequest;
import com.chemlab.entity.Molecule;
import com.chemlab.repository.MoleculeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MoleculeService {

    private final MoleculeRepository moleculeRepository;

    public MoleculeService(MoleculeRepository moleculeRepository) {
        this.moleculeRepository = moleculeRepository;
    }

    public List<Molecule> getAllMolecules() {
        return moleculeRepository.findAll();
    }

    public Molecule getMoleculeById(Long id) {
        return moleculeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Molecule not found"));
    }

    public Molecule getMoleculeByFormula(String formula) {
        return moleculeRepository.findByFormula(formula)
                .orElseThrow(() -> new RuntimeException("Molecule not found"));
    }

    public List<Molecule> searchByName(String name) {
        return moleculeRepository.findByNameContainingIgnoreCase(name);
    }

    public Molecule createMolecule(CreateMoleculeRequest request) {
        Molecule molecule = Molecule.builder()
                .name(request.getName())
                .formula(request.getFormula())
                .description(request.getDescription())
                .atomData(request.getAtomData() != null ? request.getAtomData() : "[]")
                .atomsData(request.getAtomsData())
                .bondsData(request.getBondsData())
                .build();
        return moleculeRepository.save(molecule);
    }

    public Molecule updateMolecule(Long id, CreateMoleculeRequest request) {
        Molecule molecule = moleculeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Molecule not found"));
        if (request.getName() != null) molecule.setName(request.getName());
        if (request.getFormula() != null) molecule.setFormula(request.getFormula());
        if (request.getDescription() != null) molecule.setDescription(request.getDescription());
        if (request.getAtomData() != null) molecule.setAtomData(request.getAtomData());
        if (request.getAtomsData() != null) molecule.setAtomsData(request.getAtomsData());
        if (request.getBondsData() != null) molecule.setBondsData(request.getBondsData());
        return moleculeRepository.save(molecule);
    }

    public void deleteMolecule(Long id) {
        if (!moleculeRepository.existsById(id)) {
            throw new RuntimeException("Molecule not found");
        }
        moleculeRepository.deleteById(id);
    }
}
